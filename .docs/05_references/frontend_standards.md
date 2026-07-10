# 프론트엔드 개발 표준

## 1. 현재 기술 구성

- Vite 8, React 19, TypeScript 5.9 기반 SPA를 사용함
- TanStack Router 파일 기반 라우팅을 사용함
- TanStack Query로 서버 상태를 관리함
- TanStack Form과 Zod로 폼 상태와 스키마를 구성함
- Jotai는 화면 간 공유가 필요한 클라이언트 상태에 사용함
- Tailwind CSS v4와 `@pkg/ui` 디자인 시스템을 사용함

## 2. 디렉터리 구조

- `src/routes`: 공개·보호 라우트와 화면 단위 구현
- `src/routes/**/-sections`: 화면의 주요 섹션
- `src/routes/**/-modals`: 화면 전용 모달과 다이얼로그
- `src/routes/**/-helpers`: 화면 전용 변환·표현 helper
- `src/components`: 앱 공통 컴포넌트
- `src/hooks`: 세션과 공통 동작 hook
- `src/lib`: Axios, i18n, 응답 처리, 범용 유틸리티
- `src/api/generated`: Orval 생성 React Query 클라이언트와 모델
- `src/api/zod.ts`: OpenAPI 기반 생성 Zod 스키마

## 3. 라우팅

- `createFileRoute`로 공개·보호 라우트를 선언함
- 인증·약관·비밀번호 변경 분기는 route `beforeLoad`와 세션 컨텍스트에서 처리함
- 라우트 파일 변경 후 `pnpm gen:routes`로 `routeTree.gen.ts`를 갱신함
- `routeTree.gen.ts`는 TanStack Router CLI의 생성 산출물로 관리함

## 4. API 연동

- 서버 OpenAPI 문서에서 Orval로 endpoint, model, query/mutation hook을 생성함
- 서버 계약 변경 후 `pnpm gen:api`로 `src/api/generated/**`와 `src/api/zod.ts`를 갱신함
- 생성 모델과 함수는 생성된 원본 이름으로 참조함
- Axios는 `withCredentials: true`로 세션 쿠키를 전달함
- POST, PUT, PATCH, DELETE 요청은 `/api/v1/auth/csrf`에서 토큰을 확보해 `x-csrf-token` 헤더로 전달함
- 응답 mutator는 표준 envelope의 `data`를 endpoint 결과로 반환함

## 5. 레이아웃과 스타일

- 세로 골격은 Grid, 가로 정렬은 Flex를 기본 선택으로 사용함
- 스크롤 컨테이너는 `@pkg/ui`의 `scroll`, `scroll-y`, `scroll-x` 유틸리티를 사용함
- 디자인 토큰과 공통 컴포넌트는 `packages/ui`를 신뢰 원천으로 사용함
- 반응형 클래스는 모바일 기본값에서 `md:`, `lg:` 순서로 확장함
- 키보드 포커스, label, role, aria 속성으로 상호작용 접근성을 제공함

## 6. 상태와 오류 처리

- 서버 데이터는 TanStack Query cache를 통해 공유함
- 로그인 상태는 `useSession`과 Router context를 통해 제공함
- mutation 성공 후 관련 query key를 무효화하거나 세션을 갱신함
- API 오류 메시지는 표준 `ApiResponse.error`와 공통 유틸리티로 해석함
- 로딩, 빈 상태, 오류 상태를 화면 컴포넌트에서 명시함

## 7. 검증 명령

- 타입검사: `pnpm --filter=platform-admin-web exec tsc --noEmit`
- 린트: `pnpm --filter=platform-admin-web lint`
- 빌드: `pnpm --filter=platform-admin-web build`
- 라우트 생성: `pnpm gen:routes`
- API 생성: `pnpm gen:api`
