# 백엔드 개발 표준

## 1. 현재 기술 구성

- NestJS 11과 Express 5 기반 HTTP API를 사용함
- NestJS CQRS의 `Command`, `Query`, handler로 유스케이스를 분리함
- MikroORM 7과 PostgreSQL을 데이터 계층으로 사용함
- Redis 기반 Express Session으로 로그인 상태를 관리함
- RabbitMQ 기반 메일 발행·배송 결과 처리를 마이크로서비스로 구성함
- `nestjs-cls`로 요청별 추적·인증 컨텍스트를 전달함

## 2. 도메인 구조

- `src/domains/<domain>/<feature>` feature-first 구조를 사용함
- 피처 폴더에 `*.contract.ts`, `*.handler.ts`, `*.request.dto.ts`, `*.response.dto.ts`, `*.error.ts`를 배치함
- controller와 module은 도메인 루트에 배치함
- handler의 실행 흐름은 `identify - verify - process` 단계로 구성함
- command handler는 `@Transactional()`로 데이터 변경 경계를 설정함
- query handler의 `process` 단계는 메인 조회와 response DTO 조립을 담당함

## 3. 요청·응답 계약

- 내부 CQRS 입력은 `Contract` 클래스의 `data` 속성으로 전달함
- 요청 DTO는 `EntityRequestType(Entity)` 또는 payload/id/list/page/cursor 공통 요청 타입을 우선 사용함
- 응답 DTO는 `EntityResponseType(Entity)`와 `IdResponseDto`, `IdListResponseDto`, `ListResponseDto`, `PageResponseDto`, `CursorResponseDto`, `PayloadResponseDto`를 우선 사용함
- 엔티티 기반 DTO는 Swagger와 class-validator 데코레이터로 외부 계약을 명시함
- OpenAPI 계약을 웹 생성 모델의 신뢰 원천으로 유지함

## 4. 인증과 요청 컨텍스트

- 세션 식별자는 보안 쿠키로 전달하고 Redis에 세션 데이터를 저장함
- 변경 요청은 double-submit CSRF 검증과 `x-csrf-token` 헤더를 사용함
- `ContextMiddleware`는 `traceId`, `requestId`, client 정보와 인증 컨텍스트를 CLS에 설정함
- 인증 컨텍스트는 `account`, `member`, `organization`, `terms`, `permissions` 객체로 유지함
- `AuthGuard`는 계정·멤버·조직 상태, 비밀번호, 약관, 리소스 권한 정책을 검증함

## 5. 데이터와 보안

- `CoreEntity`를 DB 모델의 신뢰 원천으로 사용함
- `deletedAt = null` 전역 필터와 감사 subscriber로 소프트 삭제를 관리함
- 비밀번호 저장과 검증은 bcrypt 기반 공통 유틸리티를 사용함
- Helmet, credential CORS, ValidationPipe whitelist, ThrottlerGuard를 공통 적용함
- 환경 변수는 Zod 스키마로 애플리케이션 시작 시 검증함

## 6. 관측성과 오류 처리

- Pino 구조화 로그를 사용하고 환경·호스트 정보를 기본 필드로 기록함
- `x-trace-id`, `x-request-id`를 응답 헤더와 표준 응답 envelope에 반영함
- `defineErrors`와 `ExceptionGuard`로 도메인 오류 코드를 정의함
- 전역 exception filter와 HTTP interceptor가 성공·실패 응답 형식을 통일함

## 7. 검증 명령

- 타입검사: `pnpm --filter=platform-service exec tsc -p tsconfig.app.json --noEmit`
- 린트: `pnpm --filter=platform-service lint`
- 테스트: `pnpm --filter=platform-service test`
- 빌드: `pnpm --filter=platform-service build`
