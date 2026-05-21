---
name: nest-cqrs-guide
description: NestJS CQRS 핸들러와 헬퍼를 작성할 때 사용합니다. Identify-Validate-Execute 패턴과 ExceptionGuard를 활용한 구조적 에러 핸들링 규칙을 강제합니다. 사용자가 "커맨드 핸들러 생성", "쿼리 추가", "CQRS 패턴 적용" 등을 요청할 때 반드시 이 스킬을 사용하세요.
---

# NestJS CQRS Pattern Guide

이 스킬은 프로젝트의 NestJS CQRS 아키텍처 표준을 정의합니다. 모든 Command와 Query 핸들러는 이 가이드를 따라 일관된 구조로 작성되어야 합니다.

## 핵심 원칙

1. **파일 분리**: 핸들러(`*.handler.ts`)와 헬퍼(`*.helpers.ts`)를 엄격히 분리합니다.
2. **에러 핸들링**: `ExceptionGuard`와 `defineErrors`를 사용하여 선언적으로 에러를 처리합니다.
3. **3단계 실행 구조**: `execute` 메서드는 `Identify` -> `Validate` -> `Execute/Process`의 흐름을 가집니다.

---

## 1. Helpers 파일 구조 (`*.helpers.ts`)

헬퍼 파일에는 Command/Query 클래스 정의, 에러 메시지 정의, 그리고 Asserter가 포함됩니다.

### Helpers 구성 요소

- **Command/Query Class**: readonly 필드를 가진 간단한 생성자 기반 클래스.
- **ERROR_MESSAGES**: `defineErrors` 유틸리티를 사용해 `message`와 `exception` 타입을 매핑.
- **Asserter**: `ExceptionGuard.setMessages(ERROR_MESSAGES)`를 통해 생성된 에러 단언자.

### Helpers 예시

```typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '../../../common/utils/exception.util';

/**
 * [도메인] [액션] 커맨드
 */
export class CreateExampleCommand {
  constructor(
    readonly id: string,
    readonly data: any,
  ) {}
}

/**
 * 에러 메시지 및 예외 타입 정의
 */
const ERROR_MESSAGES = defineErrors({
  NOT_FOUND: {
    message: '대상을 찾을 수 없습니다.',
    exception: NotFoundException,
  },
  ALREADY_EXISTS: {
    message: '이미 존재합니다.',
    exception: BadRequestException,
  },
});

/**
 * 에러 단언자
 */
export const CreateExampleAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
```

---

## 2. Handler 파일 구조 (`*.handler.ts`)

핸들러는 비즈니스 로직의 흐름을 제어하며, 세부 로직은 프라이빗 메서드로 분리합니다.

### Handler 구성 요소

- **@CommandHandler / @QueryHandler**: 해당 클래스를 핸들러로 등록.
- **private readonly Asserter**: 헬퍼에서 가져온 Asserter를 참조.
- **@Transactional()**: DB 상태를 변경하는 경우 필수 적용 (MikroORM 사용 시).
- **execute()**: 구조적 흐름을 명시적으로 호출.

### 3단계 실행 흐름 및 단언자 사용 표준 (Step-based Execution & Asserter Standard)

핸들러 비즈니스 로직은 **식별 (Identify) → 검증 (Validate) → 실행 (Process)** 단계를 거치며, 다음 규칙을 반드시 준수합니다.

#### A. 단언자(Asserter)의 명확한 역할 정의

1. **`assert(promiseOrValue, errorCode)`**:
   - **역할**: 값을 확인하고 유효할 경우 **값을 그대로 반환(Return)** 합니다.
   - **사용 위치**: 주로 `identify` 단계에서 DB 조회 Promise를 직접 인수로 전달받아 Non-Nullable 엔티티 값을 확보할 때 활용합니다.
   - **예시**: `return await this.Asserter.assert(this.repo.findOne(id), 'NOT_FOUND');`
2. **`throwIf(condition, errorCode)`**:
   - **역할**: 진리값(참/거짓 조건)을 평가하여 조건이 `true`이면 예외를 던지고, `false`이면 무사 통과합니다.
   - **사용 위치**: 주로 `validate` 단계에서 도메인 정책, 활성화 여부, 권한 등 논리 검증을 할 때 사용합니다.
   - **예시**: `this.Asserter.throwIf(!account.isActive(), 'INACTIVE');`

#### B. 프라이빗 메서드 작성 규칙

1. **구체적인 자원명 표기**: `identify`, `validate`, `process`와 같은 추상적 동사만 사용하지 않고, 대상 자원의 명칭을 함께 명시합니다.
   - *권장*: `identifyAccount()`, `validatePolicies()`, `processPasswordUpdate()`
   - *지양*: `identify()`, `validate()`, `process()`
2. **내용 없는 빈 함수 생성 금지 (Omission Rule)**:
   - 비즈니스 요건 상 `validate` 단에 아무런 논리 검증이나 `throwIf` 구문이 필요 없을 경우에는, **내용이 비어있는 `validate[Resource]` 함수를 선언하거나 호출하지 말고 해당 단계를 완전히 생략**합니다.

---

### Handler 예시

```typescript
import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Example, ExampleRepository } from '@pkg/database';
import { CreateExampleAsserter, CreateExampleCommand } from './create-example.helpers';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler implements ICommandHandler<CreateExampleCommand> {
  private readonly Asserter = CreateExampleAsserter;

  constructor(
    private readonly exampleRepo: ExampleRepository,
  ) {}

  @Transactional()
  async execute(command: CreateExampleCommand): Promise<any> {
    // 2단계 (validate)는 별도 비즈니스 정책 검증이 불필요하므로 생략 (Omission Rule 적용)
    const example = await this.identifyExample(command.id);
    return this.processExampleCreation(example, command.data);
  }

  // 1단계: identify (assert로 값을 조회 및 검증하여 Non-Nullable 값 반환)
  private async identifyExample(id: string): Promise<Example> {
    return await this.Asserter.assert(
      this.exampleRepo.findOne({ id }),
      'NOT_FOUND',
    );
  }

  // 3단계: process
  private processExampleCreation(example: Example, data: any) {
    example.update(data);
    return example;
  }
}
```

---

## 3. 작성 시 주의사항

- **import 경로**: `exception.util` 경로는 현재 모듈 위치에서 `src/common/utils/exception.util`을 향하도록 상대 경로로 작성합니다.
- **Repository 사용**: `@pkg/database`에서 필요한 Repository와 Entity를 임포트합니다.
- **타입 정의**: Command/Query의 생성자 파라미터는 `readonly`를 사용합니다.
- **문서화**: 클래스와 주요 메서드에 JSDoc 주석을 추가합니다.
- **단독 이중 래핑 금지**: DB 조회 비동기 메서드를 호출할 때 바깥에서 미리 `await`하여 변수로 담고 이를 다시 `assert`에 전달하는 식의 불필요한 단독 래핑을 피하고, DB Promise를 `assert` 메서드 내부에 직배송시킵니다.
