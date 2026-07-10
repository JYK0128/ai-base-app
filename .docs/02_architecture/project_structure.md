# 프로젝트 및 저장소 구조

## 1. 워크스페이스 구성

- Turborepo와 pnpm workspace로 `apps/*`, `packages/*`, `web/*`, `mobile/*` 경로를 관리함
- 현재 활성 프로젝트는 백엔드 1개, 웹 1개, 공통 패키지 4개로 구성함
- `mobile/*`은 향후 모바일 애플리케이션을 위한 예약 워크스페이스로 유지함

## 2. 실행 애플리케이션

- `apps/platform-service`
  - NestJS 11 기반 플랫폼 API와 RabbitMQ 마이크로서비스를 함께 실행함
  - 인증, 공지, 다국어, 가입, 메일, 멤버, 조직, 리소스, 지원, 약관 도메인을 `src/domains/*`에 배치함
  - MikroORM, Redis 세션, CSRF, CLS 요청 컨텍스트, Pino 로깅을 공통 계층에서 구성함
- `web/platform-admin-web`
  - Vite 8, React 19, TanStack Router 기반 플랫폼 관리자 SPA임
  - 파일 기반 라우트를 `src/routes/*`에 배치하고 `routeTree.gen.ts`를 생성 명령으로 관리함
  - Orval이 OpenAPI 계약에서 React Query 클라이언트와 Zod 스키마를 생성함

## 3. 공통 패키지

- `packages/config`: ESLint, TypeScript, Stylelint 공유 설정 제공
- `packages/database`: MikroORM 엔티티, CoreEntity 정적 조회 API, 마이그레이션, 시더, 구독자 제공
- `packages/shared`: common/server/web 진입점별 공통 타입과 유틸리티 제공
- `packages/ui`: React UI 컴포넌트, 디자인 토큰, Tailwind CSS v4 스타일, Storybook 제공

## 4. 의존 방향

- `platform-service`는 `@pkg/config`, `@pkg/database`, `@pkg/shared`를 사용함
- `platform-admin-web`은 `@pkg/config`, `@pkg/shared`, `@pkg/ui`를 사용함
- `@pkg/database`는 백엔드 데이터 모델의 신뢰 원천으로 유지함
- 웹 API 타입은 서버 OpenAPI 계약에서 생성하며 웹에서 `@pkg/database`를 직접 참조하지 않는 구조로 유지함

## 5. 생성 산출물

- ORM discovery metadata: `packages/database/src/metadata.json`
- DB 배포 타입: `packages/database/dist/index.d.ts`
- 웹 API 클라이언트: `web/platform-admin-web/src/api/generated/**`
- 웹 Zod 스키마: `web/platform-admin-web/src/api/zod.ts`
- TanStack Router 트리: `web/platform-admin-web/src/routeTree.gen.ts`

## 6. 루트 실행 명령

- 전체 검증: `pnpm build`, `pnpm test`, `pnpm lint`
- 로컬 웹: `pnpm web:dev`
- 서버 배포 구성 실행: `pnpm server:up`
- 웹 배포 구성 실행: `pnpm web:up`
- API 생성: `pnpm gen:api`
- 라우트 생성: `pnpm gen:routes`
- DB 빌드/시드/메타데이터: `pnpm db:build`, `pnpm db:seed`, `pnpm db:meta`
- UI 빌드/Storybook: `pnpm ui:build`, `pnpm ui:dev`

## 7. 운영 디렉터리

- `.agents`: 저장소 작업 지침과 도메인 스킬
- `.docs`: 제안, 아키텍처, 기능 명세, 매뉴얼, 개발 표준, 작업 이력
- `.k8s`: Helm/Kustomize 리소스와 로컬 배포 스크립트
- `.github`: GitHub 워크플로 및 저장소 자동화 설정
