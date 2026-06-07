# 도메인 및 디렉토리 구조 표준 & 모듈 통합 (Directory Structure & Module Integration)

## 1. 도메인 및 디렉토리 구조 표준 (Domain & Directory Structure)

### 1.1. 디렉토리 레이아웃 (Directory Layout)

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
├── events/                                 # (선택 사항) 도메인 내부 이벤트 및 후속 처리 그룹
│   ├── index.ts                            # 모든 이벤트/핸들러/퍼블리셔 일괄 export
│   ├── [feature-name].event.ts             # 내부 이벤트 payload 계약 정의
│   ├── [feature-name].handler.ts           # 이벤트 수신 후 후속 처리 오케스트레이션
│   └── [feature-name].publisher.ts         # 필요한 경우 외부 이벤트/메시지 발행 래퍼
├── handlers.ts                             # commands, queries, events 내의 핸들러들을 하나로 모으는 파일
├── [domain-name].contract.ts               # 마이크로서비스 메시지 패턴 및 payload 계약 정의
├── [domain-name].tokens.ts                 # DI 토큰, queue/client key 등 주입용 식별자 정의
├── [domain-name].helper.ts                 # 순수 변환/조회 유틸(필요한 경우)
├── [domain-name].controller.ts             # MessagePattern을 수신하고 CQRS Bus로 위임하는 컨트롤러
└── [domain-name].module.ts                 # 컨트롤러, 리포지토리, CQRS 핸들러를 등록하는 NestJS 모듈
```

### 1.2. 폴더 내 파일 규칙 (Flat File Structure)

- **Flat 구조 유지**: `commands/`와 `queries/` 폴더 내부에는 하위 폴더 없이 단일 깊이(1뎁스)로만 파일을 나열하여 관리함
- **일관된 네이밍**: 기능 단위 명칭(`[feature-name]`)을 파일명으로 활용하여 Command, Error, Handler를 단일 그룹화
  - *예시*: `create-resource.command.ts`, `create-resource.error.ts`, `create-resource.handler.ts`
- **계약/토큰/유틸 분리**: 메시지 패턴과 payload는 `*.contract.ts`, DI 식별자는 `*.tokens.ts`, 순수 변환/조회 유틸은 `*.helper.ts`로 분리함
- **이벤트 분리**: 내부 이벤트는 `*.event.ts`, 이벤트 수신/후속 처리는 `*.handler.ts`, 외부 발행 래퍼가 필요하면 `*.publisher.ts`로 분리함
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

## 2. 모듈 통합 및 핸들러 자동 등록 가이드

### 2.1. `handlers.ts` 구현 표준

- **도입 목적**: 모듈 `providers` 등록 수동 작업 누락 방지 및 자동화 보장
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

### 2.2. 모듈 등록 (`*.module.ts`)

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

### 2.3. 컨트롤러 라우팅 및 버스 위임 (`*.controller.ts`)

- **통신 표준**: 백엔드 내부 통신 규격으로 마이크로서비스 데코레이터 **`@MessagePattern`**을 단독으로 채택함
- **오케스트레이션**: 전달받은 Payload/DTO를 Command 또는 Query 객체로 래핑하여 `CommandBus.execute()`로 전달
- **참고사항**: CQRS 패턴에서는 데이터의 조회(Query) 및 변경(Command) 모두 `commandBus.execute(commandOrQuery)` 메서드로 단일 처리

```typescript
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { ResourceType } from '@pkg/database';

import { CreateResourceCommand } from './commands';
import { GetResourceCommand } from './queries';
import { RESOURCE_SERVICE_PATTERNS } from './resource.contract';

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
```

### 2.4. 컨트롤러 메서드 반환 타입 정의 표준 (Controller Return Types & Type Inference)

- **원칙**: 게이트웨이 및 백엔드 컨트롤러 라우팅 메서드는 명시적인 리턴 타입 선언 없이 컴파일러의 자동 타입 추론에 위임함
- **적용**: 컴파일러의 자동 타입 추론(`Promise<ApiResponse<T>>`)에 완전 위임
- **핵심 근거**:
  - **`ApiResponse` 구조 일관성**: 최종 응답은 `ApiResponse.success(result)`로 감싸진 `ApiResponse<T>` 형태이며 컴파일러가 최적의 구조로 자동 추론함
  - **Swagger 사양 연동**: OpenAPI 스펙 및 타입 스키마는 `@SwaggerResult(Dto)` 데코레이터를 통해 파싱하여 관리함
- **기대 효과**: 불필요한 보일러플레이트 제거, 컴파일 안전성 확보 및 코드 간결화
