# 핵심 구성 요소별 세부 구현 가이드 (Implementation Details)

## 1. Command & Query 클래스 (`*.command.ts` / `*.query.ts`)

- **역할**: 오직 데이터를 전달하기만 하는 순수 구조 객체
- **구조**: 모든 필드는 변경 불가능하도록 `readonly`로 제어하며, `@nestjs/cqrs`의 `Command<T>` 또는 `Query<T>`를 직접 상속받고 생성자 파라미터로 단일 `payload`를 래핑해 수신하는 것을 단일 공식 표준으로 삼음.

```typescript
import { Command } from '@nestjs/cqrs';

import type { CreateAnnouncementInput } from '../announcement.contract';
import type { AnnouncementOutputId } from '../announcement.types';

/**
 * 공지사항 생성 커맨드
 */
export class CreateAnnouncementCommand extends Command<AnnouncementOutputId> {
  constructor(readonly payload: CreateAnnouncementInput) {
    super();
  }
}
```

---

## 2. 에러 정의 및 어서터 파일 (`*.error.ts`)

- **역할**: 유스케이스 예외 유형 정의 및 `ExceptionGuard`를 통한 안전 단언문 빌딩
- **다국어 구조**: `message` 하위에 `ko`/`en` 언어 키를 구성하여 ClsService 언어 상태에 따라 자동 번역 제공
- **메타데이터**: 템플릿 스트링 생성을 위해 `withMetadata<M>()` 및 `withContext<C>()`를 통한 동적 데이터 주입 지원

```typescript
import { BadRequestException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

const ERROR_MESSAGES = defineErrors({
  INVALID_PERIOD: {
    message: {
      ko: '시작일은 종료일보다 이전이어야 합니다.',
      en: 'Start date must be before end date.',
    },
    exception: BadRequestException,
  },
});

export const CreateAnnouncementAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
```

---

## 3. 핸들러 파일 (`*.handler.ts`)

### 3.1. 단언자(Asserter)의 명확한 역할 정의 및 사용 표준

- **1. `assert<V>(promiseOrValue, errorCode, options?)`**
  - **동작**: 주어진 Promise 또는 값이 유효할 시 타입 캐스팅이 확보된 원래 객체 반환, 없을 시 매핑된 예외 즉시 발생
  - **용도**: 엔티티 식별(identify) 연산 시 영속 객체의 존재 여부를 검증하고 Non-Nullable 타입 개체를 즉시 안전하게 확보
  - **단일 호출 구조 (Single Await Structure)**: DB 비동기 Promise를 `assert()`에 직접 인계하여 가드를 가동함

- **2. `throwIf(condition, errorCode, options?)`**
  - **동작**: 평가된 `condition`이 `true`이면 예외 발생, `false`이면 무사 통과
  - **용도**: 도메인 비즈니스 규칙 검증(validate) 시 중복 방지, 권한 제약, 개체 활성 유무 등 논리 조건부 예외 판단 수행

- **3. `throw(errorCode, options?)`**
  - **동작**: 분기 판단 및 비정상 접근 시 조건 없이 즉각 해당 예외 투척 (`Promise<never>` 반환)

### 3.2. 프라이빗 메서드 작성 및 호출 규칙 (Naming & Orchestration)

- **1. 구체적인 자원명 명시 (Specific Naming)**
  - **규칙**: 프라이빗 메서드 네이밍 시 대상 도메인 자원을 구체적으로 결합하여 작명함
  - **권장 예시**: `verifyAnnouncementPeriod(startAt, endAt)`, `processAnnouncementCreation(input)`

- **2. 단일 오케스트레이션 유지 (Orchestration at a Glance)**
  - **시인성 확보**: 전체 제어 흐름 및 단계를 `execute()` 진입점 레벨에서 즉각 파악 가능하도록 구현
  - **선형적 흐름 유지**: 프라이빗 핵심 메서드 호출은 단계별로 분리하고 `execute()` 내에서 차례대로 호출하여 비즈니스 흐름의 가시성을 확보함
  - **Flat 구조화**: 식별, 검증, 실행 등 개별 논리 단위를 `execute()` 최상위 레벨에서 수평적(Flat)으로 나열하여 호출
  - **유연한 흐름 결합**: 요건에 따라 `식별 -> 검증 -> 추가 식별 -> 최종 실행` 등 유연하고 자연스러운 순서 조합 지원

- **3. 원자성과 일관성 보장 (Atomicity & Consistency)**
  - **원자성 (Atomicity)**:
    - **단일 책임**: 검증, 식별, 실행 등 각 프라이빗 함수는 단 하나의 명확한 논리적 책임만 수행
    - **완전 성공/실패**: 전체 성공 혹은 예외 처리로 종결되도록 구성하여 데이터 상태 변화를 안정적으로 제어
  - **일관성 (Consistency)**:
    - **결정론적 출력**: 동일 입력값 및 전제 조건에서 언제나 일관된 결과 혹은 동일한 예외를 보장
    - **무결성 수호**: 도메인 불변식(Invariant)을 철저히 수호하여 데이터 및 전체 시스템 상태 무결성 확보

- **4. 생략 규칙 (Omission Rule)**:
  - **검증 단계 생략**: 별도의 도메인 검증이 불필요한 경우, 검증 단계를 생략하고 바로 식별이나 실행을 진행하여 흐름을 유연하게 유지. 단순 참조 기반 삭제와 같이 유효성 체크 및 상태 관리가 요구되지 않을 시 어서터 검증 자체를 통째로 생략함.

- **5. 프라이빗 메서드 타입 명시 권장 (Type Explicit)**:
  - **원칙**: 외부 API 계약 구조 및 DTO 규격과의 엄격한 타입 계약 호환성 및 코드 가시성을 보장하기 위해 핸들러 클래스 내부의 `private` 헬퍼 메서드(식별/검증/실행 등)에도 명시적인 리턴 타입 지정(`Promise<AnnouncementOutputId>` 등)을 적극 권장함.

- **6. 리포지토리 DI 배제 및 Static Active Record 패턴 준수**:
  - **원칙**: 생성자 의존성 주입(DI)을 통한 리포지토리 인스턴스 획득을 배제함. 데이터베이스와의 데이터 생성, 영속화, 참조 및 삭제 등의 모든 연산은 ORM Context 내 엔티티 클래스의 스태틱 메소드(`Entity.create()`, `Entity.getReference()`)와 개체 지향 액티브 레코드 연산(`nativeUpdate()`, `remove()`)을 표준으로 삼음.

- **7. 트랜잭션 및 동기화 관리 (`@Transactional()`)**:
  - **CUD 적용**: 상태 변경(CUD)이 발생하는 Command 핸들러의 `execute()` 메서드 상단에 `@Transactional()` 필수 적용
  - **조회 격리**: 단순 데이터를 조회(R)하는 Query 핸들러는 트랜잭션 없이 경량 쿼리로 처리함
  - **자동 동기화 위임 (Auto-Flush)**: `@Transactional()` 내에서 변경 사항은 자동 동기화(Auto-Flush/Commit)되도록 설정하여 처리함
  - **ACID 규칙 준수**: 트랜잭션 내 모든 상태 변경 연산은 원자성(A), 일관성(C), 격리성(I), 지속성(D)을 엄격히 만족

---

## 4. 구현 표준 예시 (Reference Implementation Examples)

### 예시. Static Active Record 패턴 + Payload 래핑 Command 구조

```typescript
import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Announcement, AnnouncementMetadata } from '@pkg/database';

import type { AnnouncementInput, AnnouncementOutputId } from '../announcement.types';
import { CreateAnnouncementCommand } from './create-announcement.command';
import { CreateAnnouncementAsserter } from './create-announcement.error';

@CommandHandler(CreateAnnouncementCommand)
export class CreateAnnouncementHandler implements ICommandHandler<CreateAnnouncementCommand> {
  private readonly Asserter = CreateAnnouncementAsserter;

  constructor() {}

  @Transactional()
  async execute({ payload }: CreateAnnouncementCommand): Promise<AnnouncementOutputId> {
    await this.verifyAnnouncementPeriod(payload.data.startAt, payload.data.endAt);
    return this.processAnnouncementCreation(payload.data);
  }

  private async verifyAnnouncementPeriod(startAt?: string, endAt?: string): Promise<void> {
    await this.Asserter.throwIf(
      !!startAt &&
        !!endAt &&
        new Date(startAt).getTime() >= new Date(endAt).getTime(),
      'INVALID_PERIOD',
    );
  }

  private async processAnnouncementCreation(
    input: AnnouncementInput,
  ): Promise<AnnouncementOutputId> {
    const { title, content, ...rest } = input;
    const metadata = new AnnouncementMetadata({
      ...rest,
      publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : undefined,
      startAt: rest.startAt ? new Date(rest.startAt) : undefined,
      endAt: rest.endAt ? new Date(rest.endAt) : undefined,
    });

    const announcement = Announcement.create({
      title,
      content,
      metadata,
    });

    return { id: announcement.id };
  }
}
```
