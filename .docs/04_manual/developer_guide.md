# 개발자 가이드

## 1. 기본 환경

- 패키지 관리자: pnpm 9.15.9
- 태스크 실행기: Turborepo 2.9.6
- 언어 도구: TypeScript 5.9.3
- 루트에서 `pnpm install`을 실행하여 워크스페이스 의존성을 동기화함
- 환경 변수는 각 프로젝트의 dotenvx 실행 규칙과 `.env*` 구성을 사용함

## 2. 애플리케이션 실행

- 관리자 웹 개발 서버: `pnpm web:dev`
- Kubernetes 기반 서버 구성: `pnpm server:up`
- Kubernetes 기반 웹 구성: `pnpm web:up`
- UI Storybook: `pnpm ui:dev`
- HTTP health endpoint는 `/health/live`, `/health/ready`를 사용함

## 3. 백엔드 구조

- `apps/platform-service/src/domains/<domain>/<feature>`에 contract, request/response DTO, handler, error를 함께 배치함
- command/query handler는 `identify - verify - process` 단계로 실행 흐름을 구성함
- command handler의 트랜잭션 경계는 `@Transactional()`로 설정함
- 요청 컨텍스트는 Redis 세션과 `nestjs-cls`의 account/member/organization/terms/permissions 객체를 사용함
- 공통 요청·응답 타입은 `src/common/interfaces`에서 제공함

## 4. DB 패키지 구조

- `packages/database/src/domains/core`는 `CoreEntity`, `CoreRepository`, `QueryEngine` 기반 공통 API를 제공함
- `packages/database/src/domains/platform`은 announcement, i18n, member, organization, resource, support, terms 도메인 엔티티를 제공함
- 엔티티는 `CoreEntity`를 상속하고 `@Entity({ schema: 'platform' })`로 스키마를 지정함
- 엔티티별 조회는 `CoreEntity`의 static API(`findOne`, `findByPage`, `create`, `nativeUpdate` 등)를 사용함
- 복합 상태 판단은 `*.policy-*.ts`, 도메인 enum은 `*.constants.ts`에 배치함

## 5. 감사 필드와 소프트 삭제

- `CoreEntity`는 `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`, `metadata`를 제공함
- nullable 저장 필드는 `T | null = null`로 초기 상태를 명시함
- 전역 `softDelete` 필터는 `deletedAt = null`인 행을 일반 조회 대상으로 선택함
- 삭제 감사 처리는 `packages/database/src/subscribers/audit.subscriber.ts`에서 수행함

## 6. DB 변경 절차

- 엔티티 및 embeddable을 수정함
- `pnpm db:build`로 discovery metadata, generated entity type, dist 타입을 갱신함
- `pnpm --filter=@pkg/database exec tsc -p tsconfig.app.json --noEmit`로 타입을 검사함
- `pnpm --filter=@pkg/database lint`로 정적 분석을 수행함
- 스키마 이력은 `migration:create`, `migration:up`, `migration:down`, `migration:list`, `migration:pending` 스크립트로 관리함
- 개발 데이터 초기화는 `pnpm db:seed`를 사용함

## 7. API 계약 변경 절차

- 서버 contract, request/response DTO, controller를 신뢰 원천으로 갱신함
- `platform-service` 타입검사와 린트를 수행함
- 최신 서버를 실행한 상태에서 `pnpm gen:api`를 실행함
- `web/platform-admin-web/src/api/generated/**`와 `src/api/zod.ts`의 생성 결과를 확인함
- 웹 코드는 생성된 타입·hook·query option의 원본 이름을 사용함

## 8. 웹 라우트 변경 절차

- `web/platform-admin-web/src/routes/**`에 파일 기반 라우트를 추가·이동·정리함
- `pnpm gen:routes`로 `src/routeTree.gen.ts`를 갱신함
- `pnpm --filter=platform-admin-web exec tsc --noEmit`와 `pnpm --filter=platform-admin-web lint`를 수행함

## 9. 공통 검증

- 전체 빌드: `pnpm build`
- 전체 테스트: `pnpm test`
- 전체 린트: `pnpm lint`
- 변경 범위가 단일 프로젝트인 경우 `pnpm --filter=<package-name> ...` 형식으로 검증 범위를 제한함
