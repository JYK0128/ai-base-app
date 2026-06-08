# 도메인 및 디렉토리 구조 표준 & 모듈 통합 (Directory Structure & Module Integration)

## 1. 도메인 및 디렉토리 구조 표준 (Domain & Directory Structure)

### 1.1. 디렉토리 레이아웃 (Directory Layout)

- **원칙**: 모든 로직은 도메인 모듈별로 완벽 격리하며, 서비스 소스 디렉토리(`src/modules/`) 하위에 다음의 Flat 디렉토리 구성을 유지

```
announcement/                               # 예: announcement/
├── commands/                               # 도메인의 변경(CUD)을 처리하는 커맨드 그룹
│   ├── index.ts                            # 모든 커맨드/에러/핸들러 일괄 export
│   ├── [feature-name].command.ts           # 예: create-announcement.command.ts, delete-announcement.command.ts
│   ├── [feature-name].error.ts             # 예: create-announcement.error.ts, (필요시) delete-announcement.error.ts
│   └── [feature-name].handler.ts           # 예: create-announcement.handler.ts, delete-announcement.handler.ts
├── queries/                                # 도메인의 조회(R)를 처리하는 쿼리 그룹
│   ├── index.ts                            # 모든 쿼리/에러/핸들러 일괄 export
│   ├── [feature-name].query.ts             # 예: get-announcements.query.ts, get-announcement.query.ts
│   ├── [feature-name].error.ts             # 예: get-announcements.error.ts, get-announcement.error.ts
│   └── [feature-name].handler.ts           # 예: get-announcements.handler.ts, get-announcement.handler.ts
├── announcement.contract.ts                 # 마이크로서비스 메시지 패턴 및 payload 계약 정의
├── announcement.tokens.ts                   # DI 토큰, queue/client key 등 주입용 식별자 정의
├── announcement.types.ts                    # 도메인 데이터 입출력 관련 공유 타입 선언
├── announcement.helper.ts                   # 순수 변환/조회 유틸(필요한 경우)
├── announcement.controller.ts               # MessagePattern을 수신하고 CQRS Bus로 위임하는 컨트롤러
└── announcement.module.ts                   # 컨트롤러, 리포지토리, CQRS 핸들러를 등록하는 NestJS 모듈
```

### 1.2. 폴더 내 파일 규칙 (Flat File Structure)

- **Flat 구조 유지**: `commands/`와 `queries/` 폴더 내부에는 하위 폴더 없이 단일 깊이(1뎁스)로만 파일을 나열하여 관리함
- **일관된 네이밍**: 기능 단위 명칭(`[feature-name]`)을 파일명으로 활용하여 Command, Error, Handler를 단일 그룹화
  - *예시*: `create-announcement.command.ts`, `create-announcement.error.ts`, `create-announcement.handler.ts`
- **계약/토큰/타입 분리**: 메시지 패턴과 payload는 `*.contract.ts`, DI 식별자는 `*.tokens.ts`, 도메인 내 공통 타입 정의는 `*.types.ts`로 분리함
- **배럴 익스포트**: 각 폴더의 `index.ts`에서 폴더 내 모든 구성 요소를 일괄 Export 처리

```typescript
// commands/index.ts 예시
export * from './create-announcement.command';
export * from './create-announcement.error';
export * from './create-announcement.handler';
export * from './delete-announcement.command';
export * from './delete-announcement.handler';
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

export const AnnouncementHandlers = [
  ...filterHandlers(Commands),
  ...filterHandlers(Queries),
];
```

### 2.2. 모듈 등록 (`*.module.ts`)

- **바인딩**: 위에서 구성한 일괄 핸들러 배열(`AnnouncementHandlers`)을 `providers`에 스프레드 연산자(`...`)로 바인딩
- **ORM 격리**: 스태틱 액티브 레코드를 활용하여 리포지토리 DI 주입을 피할지라도, 엔티티 로딩을 위해 `MikroOrmModule.forFeature`에 엔티티 타입을 바인딩함

```typescript
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Announcement } from '@pkg/database';

import { AnnouncementController } from './announcement.controller';
import { AnnouncementHandlers } from './handlers';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Announcement]),
  ],
  controllers: [AnnouncementController],
  providers: [...AnnouncementHandlers], // 자동 필터링 핸들러 적용
})
export class AnnouncementModule {}
```

### 2.3. 컨트롤러 라우팅 및 버스 위임 (`*.controller.ts`)

- **통신 표준**: 백엔드 내부 통신 규격으로 마이크로서비스 데코레이터 **`@MessagePattern`**을 단독으로 채택함
- **오케스트레이션**: 전달받은 Payload를 Command 객체에 직접 주입(payload 변수 래핑 형식)하여 `CommandBus.execute()`로 전달

```typescript
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ANNOUNCEMENT_SERVICE_PATTERNS, CreateAnnouncementInput } from './announcement.contract';
import { CreateAnnouncementCommand } from './commands';

@Controller()
export class AnnouncementController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  /** 공지사항 생성 (Command 위임) */
  @MessagePattern(ANNOUNCEMENT_SERVICE_PATTERNS.ANNOUNCEMENT.CREATE)
  async createAnnouncement(
    @Payload() data: CreateAnnouncementInput,
  ) {
    return this.commandBus.execute(new CreateAnnouncementCommand(data));
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
