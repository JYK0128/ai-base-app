---
name: nest-cqrs-guide
description: NestJS CQRS 핸들러와 에러/어서터 구조를 작성할 때 사용합니다. 세 개 파일로 나뉜 CQRS 구조(*.command.ts/*.query.ts, *.error.ts, *.handler.ts)와 ExceptionGuard를 활용한 다국어/메타데이터 지원 구조적 에러 핸들링 규칙, 그리고 Vitest 단위 테스트 가이드를 상세히 정의합니다.
---

# NestJS CQRS & Exception Guard 아키텍처 표준 가이드

- **스킬 목적**: NestJS CQRS 아키텍처 및 선언적 에러 핸들링(`ExceptionGuard`) 표준 수립
- **적용 대상**: 프로젝트 내 모든 Command 및 Query 핸들러 작성 시 엄격 준수

---

## 1. 핵심 아키텍처 원칙

- **1. 엄격한 파일 삼중 분리 (Three-File Decoupling)**
  - **DTO 분리 (`*.command.ts` / `*.query.ts`)**: 데이터 바인딩을 위한 무상태(Stateless) readonly DTO 클래스 구성
  - **예외 사전화 (`*.error.ts`)**: `defineErrors`를 통한 도메인 예외 사전화 및 `ExceptionGuard` 단언자 선언적 구현
  - **흐름 제어 (`*.handler.ts`)**: 의존성 주입(DI), 트랜잭션 격리, 비즈니스 흐름 조율을 담당하는 중추 핸들러 설계

- **2. 선언적 예외 처리 (Declarative Exceptions)**
  - **비즈니스 시인성**: 핸들러 내 전통적인 `throw new Exception` 직접 사용 배제를 통한 비즈니스 로직 시인성 확보
  - **단언자 패턴**: Asserter 메서드(`assert`, `throwIf`)를 활용한 예외 조건 검사 및 에러 발생의 통합 처리
  - **다국어 현지화**: 예외 응답 메시지 내 `ko`/`en` 쌍 필수 정의를 통한 글로벌 마이크로서비스 사양 준수

- **3. 단일 오케스트레이션 (Single Orchestration)**
  - **비선형 호출 금지**: 핵심 연산 프라이빗 메서드 간의 깊은 중첩 및 비선형적 연쇄 호출(Non-linear Chained Call) 전면 금지
  - **수평적 직접 배치**: 식별(Identify), 검증(Validate), 실행(Process) 단위를 `execute()` 내에 수평적(Flat)으로 나열
  - **단일 흐름 가시성**: 비즈니스 요건에 따라 전체 실행 흐름이 직관적으로 한눈에 파악되도록 설계

---

## 2. 도메인 및 디렉토리 구조 표준 (Domain & Directory Structure)

### 2.1. 디렉토리 레이아웃 (Directory Layout)

- **원칙**: 모든 로직은 도메인 모듈별로 완벽 격리하며, 서비스 소스 디렉토리(`src/modules/`) 하위에 다음의 Flat 디렉토리 구성을 유지

```
[domain-name]/                              # 예: resource/, support/, terms/
├── commands/                               # 도메인의 변경(CUD)을 처리하는 커맨드 그룹
│   ├── index.ts                            # 모든 커맨드/에러/핸들러 일괄 export
│   ├── [feature-name].command.ts           # 예: create-resource.command.ts, agree-terms.command.ts
│   ├── [feature-name].error.ts             # 예: create-resource.error.ts, agree-terms.error.ts
│   └── [feature-name].handler.ts           # 예: create-resource.handler.ts, agree-terms.handler.ts
├── queries/                                # 도메인의 조회(R)를 처리하는 쿼리 그룹
│   ├── index.ts                            # 모든 쿼리/에러/핸들러 일괄 export
│   ├── [feature-name].query.ts             # 예: get-resource.query.ts, get-active-terms.query.ts
│   ├── [feature-name].error.ts             # 예: get-resource.error.ts, get-active-terms.error.ts
│   └── [feature-name].handler.ts           # 예: get-resource.handler.ts, get-active-terms.handler.ts
├── events/                                 # (선택 사항) 도메인 관련 비동기 이벤트 핸들러 그룹
├── handlers.ts                             # commands, queries, events 내의 핸들러들을 하나로 모으는 파일
├── [domain-name].constants.ts              # 도메인별 상수 및 마이크로서비스 메시지 패턴 정의
├── [domain-name].controller.ts             # MessagePattern을 수신하고 CQRS Bus로 위임하는 컨트롤러
└── [domain-name].module.ts                 # 컨트롤러, 리포지토리, CQRS 핸들러를 등록하는 NestJS 모듈
```

### 2.2. 폴더 내 파일 규칙 (Flat File Structure)

- **Flat 구조 유지**: `commands/`와 `queries/` 폴더 내부에 하위 폴더 생성 엄격 금지 (1뎁스로 파일 나열)
- **일관된 네이밍**: 기능 단위 명칭(`[feature-name]`)을 파일명으로 활용하여 Command, Error, Handler를 단일 그룹화
  - *예시*: `create-resource.command.ts`, `create-resource.error.ts`, `create-resource.handler.ts`
- **배럴 익스포트**: 각 폴더의 `index.ts`에서 폴더 내 모든 구성 요소를 일괄 Export 처리

```typescript
// commands/index.ts 예시
export * from './create-resource.command';
export * from './create-resource.error';
export * from './create-resource.handler';
export * from './delete-resource.command';
export * from './delete-resource.error';
export * from './delete-resource.handler';
```

---

## 3. 모듈 통합 및 핸들러 자동 등록 가이드

### 3.1. `handlers.ts` 구현 표준

- **도입 목적**: 수동으로 모듈 `providers`에 새 핸들러를 등록할 때 발생하는 누락 오류 전면 차단
- **작동 원리**: 파일 이름이 `Handler`로 끝나는 클래스들만 런타임에 자동 검색/필터링하여 배열로 일괄 등록

```typescript
import * as Commands from './commands';
import * as Events from './events'; // 이벤트 핸들러 모듈이 있을 경우 포함
import * as Queries from './queries';

/**
 * 모듈 내 'Handler'로 끝나는 클래스들만 필터링하여 반환합니다.
 */
const filterHandlers = (modules: Record<string, unknown>) =>
  Object.values(modules).filter(
    (val): val is { new (...args: unknown[]): unknown, name: string } =>
      typeof val === 'function'
      && 'name' in val
      && typeof val.name === 'string'
      && val.name.endsWith('Handler'),
  );

export const ResourceHandlers = [
  ...filterHandlers(Commands),
  ...filterHandlers(Queries),
  ...filterHandlers(Events),
];
```

### 3.2. 모듈 등록 (`*.module.ts`)

- **바인딩**: 위에서 구성한 일괄 핸들러 배열(`ResourceHandlers`)을 `providers`에 스프레드 연산자(`...`)로 바인딩

```typescript
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Resource } from '@pkg/database';

import { ResourceHandlers } from './handlers';
import { ResourceController } from './resource.controller';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Resource]),
  ],
  controllers: [ResourceController],
  providers: [...ResourceHandlers], // 자동 필터링 핸들러 적용
})
export class ResourceModule {}
```

### 3.3. 컨트롤러 라우팅 및 버스 위임 (`*.controller.ts`)

- **통신 표준**: 백엔드 내부 통신이므로, HTTP 대신 마이크로서비스 데코레이터 **`@MessagePattern`** 단독 채택
- **오케스트레이션**: 전달받은 Payload/DTO를 Command 또는 Query 객체로 래핑하여 `CommandBus.execute()`로 전달
- **참고사항**: CQRS 패턴에서는 데이터의 조회(Query) 및 변경(Command) 모두 `commandBus.execute(commandOrQuery)` 메서드로 단일 처리

```typescript
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { ResourceType } from '@pkg/database';

import { CreateResourceCommand } from './commands';
import { GetResourceCommand } from './queries';
import { RESOURCE_SERVICE_PATTERNS } from './resource.constants';

@Controller()
export class ResourceController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  /** 리소스 단건 조회 (Query 위임) */
  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.GET)
  async getResource(
    @Payload() data: { id: string },
  ) {
    return this.commandBus.execute(new GetResourceCommand(data.id));
  }

  /** 리소스 생성 (Command 위임) */
  @MessagePattern(RESOURCE_SERVICE_PATTERNS.RESOURCE.CREATE)
  async createResource(
    @Payload() data: {
      code: string;
      name: string;
      type: ResourceType;
      parentId?: string;
    },
  ) {
    return this.commandBus.execute(new CreateResourceCommand(
      data.code,
      data.name,
      data.type,
      undefined,
      undefined,
      data.parentId,
    ));
  }
}

### 3.4. 컨트롤러 메서드 반환 타입 정의 표준 (Controller Return Types & Type Inference)

- **원칙**: 게이트웨이 및 백엔드 컨트롤러 라우팅 메서드의 명시적 리턴 타입 선언(예: `: Promise<ResponseDto>`) 전면 생략
- **적용**: 컴파일러의 자동 타입 추론(`Promise<ApiResponse<T>>`)에 완전 위임
- **핵심 근거**:
  - **`ApiResponse` 구조 불일치 방지**: 최종 응답은 `ApiResponse.success(result)`로 감싸진 `ApiResponse<T>` 형태임. 수동으로 `Promise<T>` 기재 시 루트의 필수 속성(예: `id`) 누락으로 컴파일 에러(`Property 'id' is missing...`) 발생
  - **Swagger 중복 정의 배제**: OpenAPI 스펙/타입 스키마는 오직 `@SwaggerResult(Dto)` 데코레이터를 통해서만 파싱됨. 메서드 시그니처 상의 타입 어노테이션은 Swagger 문서에 무영향
- **기대 효과**: 불필요한 보일러플레이트 제거, 컴파일 안전성 확보 및 코드 간결화
```

---

## 4. 핵심 구성 요소별 세부 구현 가이드

### 4.1. Command & Query 클래스 (`*.command.ts` / `*.query.ts`)

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

### 4.2. 에러 정의 및 어서터 파일 (`*.error.ts`)

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

### 4.3. 핸들러 파일 (`*.handler.ts`)

#### A. 단언자(Asserter)의 명확한 역할 정의 및 사용 표준

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

#### B. 프라이빗 메서드 작성 및 호출 규칙 (Naming & Orchestration)

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

---

## 5. 단위 테스트 작성 표준 (Testing Guide)

- **테스트 러너**: **Vitest** 프레임워크 전면 사용
- **단위 격리 모킹**: 데이터베이스 실 연결 및 인프라 오버헤드 차단을 위해 EntityManager 및 Repository는 `vi.fn()`으로 모킹 처리
- **가드 검증**: Asserter 동작에 따른 비즈니스 예외 투척 상황을 `.rejects.toBeInstanceOf(Exception)` 구문으로 엄격히 실 단언 검증

```typescript
import { EntityManager } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Resource, ResourceType } from '@pkg/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetResourceHandler } from './get-resource.handler';
import { GetResourceCommand } from './get-resource.query';

describe('GetResourceHandler', () => {
  let em: EntityManager;
  let handler: GetResourceHandler;
  let findOneMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findOneMock = vi.fn();
    em = {
      findOne: findOneMock,
    } as unknown as EntityManager;

    handler = new GetResourceHandler(em);
  });

  it('성공적으로 단일 리소스를 조회하고 노드 상세 데이터를 반환해야 한다', async () => {
    // Given
    const mockResource = {
      id: 'res-1',
      code: 'SYSTEM_SETTINGS',
      name: '시스템 설정',
      type: ResourceType.MENU,
      path: '/settings',
      icon: 'SettingIcon',
      sortOrder: 1,
      actions: ['READ', 'UPDATE'],
      parent: { id: 'parent-0' } as Resource,
    } as unknown as Resource;

    findOneMock.mockResolvedValueOnce(mockResource);

    // When
    const result = await handler.execute(new GetResourceCommand('res-1'));

    // Then
    expect(result).toEqual({
      id: 'res-1',
      code: 'SYSTEM_SETTINGS',
      name: '시스템 설정',
      type: ResourceType.MENU,
      path: '/settings',
      icon: 'SettingIcon',
      sortOrder: 1,
      actions: ['READ', 'UPDATE'],
      parentId: 'parent-0',
    });

    expect(findOneMock).toHaveBeenCalledWith(
      expect.any(Function),
      { id: 'res-1' },
      { populate: ['parent'] },
    );
  });

  it('리소스를 찾을 수 없는 경우 NotFoundException을 던져야 한다', async () => {
    // Given
    findOneMock.mockResolvedValueOnce(null);

    // When & Then
    await expect(handler.execute(new GetResourceCommand('non-existent')))
      .rejects
      .toBeInstanceOf(NotFoundException);
  });
});
```

---

## 6. 기타 주의사항 및 린트 가이드

- **Import 규칙**: 모듈 외부의 전역 유틸리티/공용 컴포넌트는 상대 경로(Relative Path)를 사용하고, 도메인 데이터베이스 및 패키지 구조는 `@pkg/database`와 같은 전역 단축 오라클 임포트 명칭 활용
- **Transactional 제어**: `execute()` 내의 전체 로직 흐름이 원자적(Atomic) 트랜잭션 단위로 묶여야만 할 경우에 국한하여 부여하며, 단순 조회를 수행하는 Query 핸들러에는 전면 적용 지양
