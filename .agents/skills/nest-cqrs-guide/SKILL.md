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
- **execute()**: 3단계 흐름을 명시적으로 호출.

### 3단계 실행 흐름 (Step-based Execution)

1. **Identify (식별)**: 필요한 엔티티를 조회하고 존재 여부를 `Asserter.assert`로 확인합니다.
2. **Validate (검증)**: 비즈니스 정책이나 권한을 `Asserter.throwIf` 또는 `Asserter.assert`로 검증합니다.
3. **Execute/Process (실행)**: 실제 상태 변경 로직을 수행합니다.

### Handler 예시

```typescript
import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExampleRepository } from '@pkg/database';
import { CreateExampleAsserter, CreateExampleCommand } from './create-example.helpers';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler implements ICommandHandler<CreateExampleCommand> {
  private readonly Asserter = CreateExampleAsserter;

  constructor(
    private readonly exampleRepo: ExampleRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateExampleCommand): Promise<any> {
    const entity = await this.identify(command.id);
    await this.validate(entity);
    return this.process(entity, command.data);
  }

  private async identify(id: string) {
    return await this.Asserter.assert(
      this.exampleRepo.findOne({ id }),
      'NOT_FOUND',
    );
  }

  private async validate(entity: any) {
    await this.Asserter.throwIf(entity.isLocked, 'ALREADY_LOCKED');
  }

  private process(entity: any, data: any) {
    // 로직 수행...
    return result;
  }
}
```

---

## 3. 작성 시 주의사항

- **import 경로**: `exception.util` 경로는 현재 모듈 위치에서 `src/common/utils/exception.util`을 향하도록 상대 경로로 작성합니다.
- **Repository 사용**: `@pkg/database`에서 필요한 Repository와 Entity를 임포트합니다.
- **타입 정의**: Command/Query의 생성자 파라미터는 `readonly`를 사용합니다.
- **문서화**: 클래스와 주요 메서드에 JSDoc 주석을 추가합니다.
