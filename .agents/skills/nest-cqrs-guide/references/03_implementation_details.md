# 핵심 구성 요소별 세부 구현 가이드 (Implementation Details)

## 1. Command & Query 클래스 (`*.command.ts` / `*.query.ts`)

- **역할**: 오직 데이터를 전달하기만 하는 순수 구조 객체
- **제약**: 모든 필드는 변경 불가능하도록 `readonly`로 제어

```typescript
export class CreateResourceCommand {
  constructor(
    readonly code: string,
    readonly name: string,
    readonly type: ResourceType,
  ) {}
}
```

---

## 2. 에러 정의 및 어서터 파일 (`*.error.ts`)

- **역할**: 유스케이스 예외 유형 정의 및 `ExceptionGuard`를 통한 안전 단언문 빌딩
- **다국어 구조**: `message` 하위에 `ko`/`en` 언어 키를 구성하여 ClsService 언어 상태에 따라 자동 번역 제공
- **메타데이터**: 템플릿 스트링 생성을 위해 `withMetadata<M>()` 및 `withContext<C>()`를 통한 동적 데이터 주입 지원

```typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

const ERROR_MESSAGES = defineErrors({
  ALREADY_EXISTS: {
    message: {
      ko: '이미 동일한 코드의 리소스가 존재합니다.',
      en: 'A resource with the same code already exists.',
    },
    exception: BadRequestException,
  },
  PARENT_NOT_FOUND: {
    message: {
      ko: '상위 리소스를 찾을 수 없습니다.',
      en: 'Parent resource not found.',
    },
    exception: NotFoundException,
  },
});

export const CreateResourceAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
```

---

## 3. 핸들러 파일 (`*.handler.ts`)

### 3.1. 단언자(Asserter)의 명확한 역할 정의 및 사용 표준

- **1. `assert<V>(promiseOrValue, errorCode, options?)`**
  - **동작**: 주어진 Promise 또는 값이 falsy(`null`, `undefined` 등)이면 매핑된 예외 즉시 발생, 유효할 시 타입 캐스팅이 확보된 원래 객체 반환
  - **용도**: 엔티티 식별(identify) 연산 시 영속 객체의 존재 여부를 검증하고 Non-Nullable 타입 개체를 즉시 안전하게 확보
  - **이중 await 금지 (No Double Wrapping)**: DB 비동기 Promise를 직접 `assert()`에 인계하여 한 번에 가로채고 가드 가동
    - *권장*: `await this.Asserter.assert(this.repo.findOne(id), 'NOT_FOUND')`
    - *지양*: `const raw = await this.repo.findOne(id); await this.Asserter.assert(raw, 'NOT_FOUND')`

- **2. `throwIf(condition, errorCode, options?)`**
  - **동작**: 평가된 `condition`이 `true`이면 예외 발생, `false`이면 무사 통과
  - **용도**: 도메인 비즈니스 규칙 검증(validate) 시 중복 방지, 권한 제약, 개체 활성 유무 등 논리 조건부 예외 판단 수행

- **3. `throw(errorCode, options?)`**
  - **동작**: 분기 판단 및 비정상 접근 시 조건 없이 즉각 해당 예외 투척 (`Promise<never>` 반환)

### 3.2. 프라이빗 메서드 작성 및 호출 규칙 (Naming & Orchestration)

- **1. 구체적인 자원명 명시 (Specific Naming)**
  - **규칙**: 프라이빗 메서드 네이밍 시 `identify`, `validate` 같은 단순 동사 사용 금지, 대상 도메인 자원을 구체적으로 결합하여 작명
  - *올바른 예*: `identifyParentResource(id)`, `validateNoDuplicateCode(code)`, `processResourceCreation(...)`
  - *나쁜 예*: `identify()`, `validate()`, `process()`

- **2. 단일 오케스트레이션 유지 (Orchestration at a Glance)**
  - **시인성 확보**: 전체 제어 흐름 및 단계를 `execute()` 진입점 레벨에서 즉각 파악 가능하도록 구현
  - **비선형적 체이닝 금지**: 프라이빗 핵심 메서드가 타 핵심 단계를 직접 내포하거나 중첩 호출하는 행위 엄격 금지 (비즈니스 흐름 은폐 방지)
  - **Flat 구조화**: 식별, 검증, 실행 등 개별 논리 단위를 `execute()` 최상위 레벨에서 수평적(Flat)으로 나열하여 호출
  - **유연한 흐름 결합**: 요건에 따라 `식별 -> 검증 -> 추가 식별 -> 최종 실행` 등 유연하고 자연스러운 순서 조합 지원

- **3. 원자성과 일관성 보장 (Atomicity & Consistency)**
  - **원자성 (Atomicity)**:
    - **단일 책임**: 검증, 식별, 실행 등 각 프라이빗 함수는 단 하나의 명확한 논리적 책임만 수행
    - **완전 성공/실패**: 불완전한 상태 변화나 부작용(Side-effect)을 철저히 배제하고 전체 성공 혹은 예외 처리로 종결
  - **일관성 (Consistency)**:
    - **결정론적 출력**: 동일 입력값 및 전제 조건에서 언제나 일관된 결과 혹은 동일한 예외를 보장
    - **무결성 수호**: 도메인 불변식(Invariant)을 철저히 수호하여 데이터 및 전체 시스템 상태 무결성 확보

- **4. 생략 규칙 (Omission Rule)**:
  - **검증 단단계 생략**: 별도의 도메인 검증이 불필요한 경우, 검증 단계를 생략하고 바로 식별이나 실행을 진행하여 흐름을 유연하게 유지

- **5. 프라이빗 메서드 타입 추론 권장 (Private Method Type Inference)**:
  - **원칙**: 핸들러 클래스 내부의 `private` 헬퍼 메서드(식별/검증/실행 등) 또한 명시적 리턴 타입 선언(`: Promise<void>` 또는 `: Promise<T>`)을 생략하고 자동 타입 추론에 위임할 것을 권장
  - **효과**: 프라이빗 영역 내의 내부 헬퍼들이므로 시그니처 관리 비용을 줄이고, 검증 로직 변경 시 유연한 코드 변경 지원

- **6. 트랜잭션 및 동기화 관리 (`@Transactional()`)**:
  - **CUD 적용**: 상태 변경(CUD)이 발생하는 Command 핸들러의 `execute()` 메서드 상단에 `@Transactional()` 필수 적용
  - **조회 배제**: 단순 데이터를 조회(R)하는 Query 핸들러에는 불필요한 트랜잭션 적용 지양
  - **수동 호출 금지**: `@Transactional()` 내에서 변경 사항은 자동 동기화(Auto-Flush/Commit)되므로 `em.flush()` 및 `em.persist()` 사용 금지
  - **ACID 규칙 준수**: 트랜잭션 내 모든 상태 변경 연산은 원자성(A), 일관성(C), 격리성(I), 지속성(D)을 엄격히 만족

```typescript
import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceRepository } from '@pkg/database';

import { CreateResourceCommand } from './create-resource.command';
import { CreateResourceAsserter } from './create-resource.error';

@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand> {
  private readonly Asserter = CreateResourceAsserter;

  constructor(
    private readonly resourceRepo: ResourceRepository,
  ) {}

  @Transactional()
  async execute(command: CreateResourceCommand): Promise<{ id: string }> {
    // execute 상위 레벨에서 비즈니스 흐름을 한눈에 식별 (Flat 구조 및 단일 오케스트레이션)
    await this.validateNoDuplicateCode(command.code);
    const parent = await this.identifyParentResource(command.parentId);
    return this.processResourceCreation(command, parent);
  }

  private async validateNoDuplicateCode(code: string): Promise<void> {
    const existing = await this.resourceRepo.findOne({ code });
    await this.Asserter.throwIf(!!existing, 'ALREADY_EXISTS');
  }

  private async identifyParentResource(parentId?: string): Promise<Resource | undefined> {
    if (!parentId) return undefined;
    return await this.Asserter.assert(
      this.resourceRepo.findOne({ id: parentId }),
      'PARENT_NOT_FOUND',
    );
  }

  private processResourceCreation(
    command: CreateResourceCommand,
    parent: Resource | undefined,
  ): { id: string } {
    const resource = this.resourceRepo.create({
      code: command.code,
      name: command.name,
      type: command.type,
      parent,
    });

    return { id: resource.id };
  }
}
```
