# Auth 정책 흐름 정리 - 2026-06-19

## 목적

인증/인가에서 상태 정책이 여러 곳에 흩어져 있었던 부분을 정리하고, 현재는 어떤 정책을 어디서 막는지 한눈에 보이도록 정리한다.

## 현재 구조

### 1) 코드 변수명

| 변수명 | 실제 의미 |
|---|---|
| `accountStatus` | 계정 상태 값 |
| `memberStatus` | 회원 상태 값 |
| `organizationStatus` | 조직 상태 값 |
| `isDormant` | 휴면 여부 |
| `isPasswordExpired` | 비밀번호 만료 여부 |

### 2) 상태 항목

| 항목 | 실제 값 | 풀어쓴 의미 |
|---|---|---|
| 계정 활성 상태 | `ACTIVE`, `INACTIVE` | 계정이 로그인과 요청을 계속 수행할 수 있는지 |
| 회원 활성 상태 | `ACTIVE`, `INACTIVE` | 회원 자격이 유지되어 시스템 사용이 허용되는지 |
| 조직 활성 상태 | `PENDING`, `ACTIVE`, `INACTIVE`, `REJECTED` | 소속 조직이 정상 운영 중이라 접근이 허용되는지 |
| 휴면 상태 | `true`, `false` | 장기간 미사용으로 계정 사용이 잠긴 상태인지 |
| 비밀번호 만료 상태 | `true`, `false` | 비밀번호를 변경해야만 계속 사용할 수 있는 상태인지 |

### 3) 상태값

| 상태 | 의미 |
|---|---|
| `ACTIVE` | 정상 사용 가능 |
| `INACTIVE` | 비활성 상태 |
| `PENDING` | 아직 활성화 전 |
| `REJECTED` | 거절 상태 |

### 4) 정책 판정

| 상황 | 적용 위치 | 판정 기준 | 비고 |
|---|---|---|---|
| 일반 API 요청 | `apps/platform-service/src/common/guards/auth.guard.ts` | 계정/회원/조직 활성 상태, 휴면 상태, 비밀번호 만료 상태, 약관 동의 여부 | `AuthGuard`에서 차단 |
| `/auth/me` | `apps/platform-service/src/common/guards/auth.guard.ts` | 계정/회원/조직 활성 상태, 휴면 상태, 비밀번호 만료 상태, 약관 동의 여부 | 약관 미동의 시 403 |
| 로그인 | `apps/platform-service/src/domains/auth/login/login.handler.ts` | 계정/회원/조직 활성 상태, 휴면 상태 | 세션 스냅샷을 생성하고 세션에 저장 |
| 비밀번호 만료 | `apps/platform-service/src/common/guards/auth.guard.ts` | 비밀번호 만료 상태 | `BYPASS_POLICIES.PASSWORD` 가능 |
| 약관 미동의 | `apps/platform-service/src/common/guards/auth.guard.ts` + `TermsAgreementService` | 최신 유효 약관 기준 미동의 여부 | `BYPASS_POLICIES.TERMS` 가능 |
| 로그인 실패 잠금 | `apps/platform-service/src/domains/auth/login/login.handler.ts` | 실패 횟수 누적 | 캐시 기반 잠금, 로그인 전용 |
| personal 리소스 소유권 | `apps/platform-service/src/common/guards/auth.guard.ts` | 요청 owner id 와 세션 member 비교 | `@Personal` 대상만 적용 |
| 권한 체크 | `apps/platform-service/src/common/guards/auth.guard.ts` | 필요 permission 보유 여부 | `@Permissions` 대상만 적용 |

## `/auth/me` 데이터 출처

`/auth/me`는 CLS에 미리 채워진 스냅샷만 읽는다.
스냅샷 자체는 `ContextMiddleware`가 DB 조회 결과로 만든다.

| 출처 | 키 / 대상 | 용도 |
|---|---|---|
| CLS | `account` | 응답의 계정 기본 정보 |
| CLS | `member` | 응답의 멤버 정보 |
| CLS | `organization` | 응답의 조직 정보 |
| CLS | `permissions` | 응답의 권한 목록 |
| CLS | `terms` | 최신 약관별 동의 상태 목록 |
| CLS | `account` | 정책 판정 및 추적용 계정 스냅샷 |
| DB | `MemberAccount` | `ContextMiddleware`가 `account`, `member`, `organization`, `permissions`를 만들기 위해 조회 |
| DB | `member.organization` | 조직 스냅샷 생성용 |
| DB | `member.roles.organization` | 권한 판정에 필요한 조직 연결 정보 |
| DB | `member.roles.role.permissions.resource` | 권한 문자열 생성에 필요한 자원 연결 정보 |

### `/auth/me` 응답 필드별 출처

| 응답 필드 | 출처 | 비고 |
|---|---|---|
| `account.id` | CLS | `ContextMiddleware`가 만든 계정 스냅샷 |
| `account.email` | CLS | `ContextMiddleware`가 만든 계정 스냅샷 |
| `account.status` | CLS | `ContextMiddleware`가 만든 계정 스냅샷 |
| `account.lastLoginAt` | CLS | `ContextMiddleware`가 만든 계정 스냅샷 |
| `account.passwordExpiresAt` | CLS | `ContextMiddleware`가 만든 계정 스냅샷 |
| `account.isDormant` | CLS | `ContextMiddleware`가 만든 계정 스냅샷 |
| `account.isPasswordExpired` | CLS | `ContextMiddleware`가 만든 계정 스냅샷 |
| `member.id` | CLS | `ContextMiddleware`가 만든 멤버 스냅샷 |
| `member.name` | CLS | `ContextMiddleware`가 만든 멤버 스냅샷 |
| `member.status` | CLS | `ContextMiddleware`가 만든 멤버 스냅샷 |
| `organization.id` | CLS | `ContextMiddleware`가 만든 조직 스냅샷 |
| `organization.code` | CLS | `ContextMiddleware`가 만든 조직 스냅샷 |
| `organization.name` | CLS | `ContextMiddleware`가 만든 조직 스냅샷 |
| `organization.email` | CLS | `ContextMiddleware`가 만든 조직 스냅샷 |
| `organization.status` | CLS | `ContextMiddleware`가 만든 조직 스냅샷 |
| `permissions` | CLS | `ContextMiddleware`에서 미리 계산한 권한 목록 |

## CLS 값 출처

`apps/platform-service/src/common/middlewares/context.middleware.ts`가 요청마다 CLS를 채운다.

| CLS 키 | 출처 | 생성 / 설정 위치 |
|---|---|---|
| `sid` | 쿠키 `sid` 또는 새 UUID | `setTraceContext()` |
| `traceId` | 요청 헤더 `x-trace-id` 또는 새 UUID | `setTraceContext()` |
| `requestId` | 새 UUID | `setTraceContext()` |
| `clientIp` | `x-real-ip` 또는 `req.ip` | `setClientContext()` |
| `userAgent` | 요청 헤더 `user-agent` | `setClientContext()` |
| `referer` | 요청 헤더 `referer` | `setClientContext()` |
| `method` | 요청 메서드 | `setClientContext()` |
| `url` | 요청 URL | `setClientContext()` |
| `acceptLanguage` | 요청 헤더 `accept-language` 또는 기본값 `en` | `setClientContext()` |
| `account` | DB의 `MemberAccount` 스냅샷 | `setUserContext()` |
| `member` | DB의 `Member` 스냅샷 | `setUserContext()` |
| `organization` | DB의 `Organization` 스냅샷 | `setUserContext()` |
| `permissions` | DB에서 계산한 권한 코드 배열 | `setUserContext()` |
| `terms` | 최신 유효 약관 동의 상태 목록 스냅샷 | `setUserContext()` |
| `isPasswordExpired` | DB의 `MemberAccount.isPasswordExpired` | `setUserContext()` |
| `isDormant` | DB의 `MemberAccount.isDormant` | `setUserContext()` |

## 판정 기준에 따른 오류 매핑

| 판정 기준 | 위반 코드 | 공통 메시지 | 적용 레이어 |
|---|---|---|---|
| 계정 활성 상태가 아님 | `INACTIVE_ACCOUNT` | `비활성화된 계정입니다. 관리자에게 문의하세요.` | 로그인, AuthGuard |
| 회원 활성 상태가 아님 | `INACTIVE_MEMBER` | `비활성화된 멤버 권한입니다. 관리자에게 문의하세요.` | 로그인, AuthGuard |
| 조직 활성 상태가 아님 | `INACTIVE_ORGANIZATION` | `소속 조직이 활성화 상태가 아닙니다. 관리자에게 문의하세요.` | 로그인, AuthGuard |
| 휴면 상태 | `DORMANT_ACCOUNT` | `장기간 미접속으로 인해 휴면 상태로 전환된 계정입니다. 본인 인증 후 이용해주세요.` | 로그인, AuthGuard |
| 비밀번호 변경 필요 | `PASSWORD_CHANGE_REQUIRED` | `비밀번호를 변경해야 이용할 수 있습니다.` | AuthGuard |
| 약관 동의 필요 | `TERMS_AGREEMENT_REQUIRED` | `약관에 동의해야 이용할 수 있습니다.` | AuthGuard |

## HTTP 상태 코드

| 상황 | 예외 | HTTP Status | 비고 |
|---|---|---:|---|
| 세션 없음 | `UnauthorizedException` | `401` | `sid` 쿠키 없음 또는 세션 로드 실패 |
| 세션 형식 오류 | `UnauthorizedException` | `401` | 세션 쿠키 위조 또는 만료 |
| 요청 컨텍스트 누락 | `UnauthorizedException` | `401` | `account`, `member`, `organization` 등 CLS 스냅샷 없음 |
| 계정 비활성 | `ForbiddenException` | `403` | 정책 차단 |
| 회원 비활성 | `ForbiddenException` | `403` | 정책 차단 |
| 조직 비활성 | `ForbiddenException` | `403` | 정책 차단 |
| 휴면 계정 | `ForbiddenException` | `403` | 정책 차단 |
| 비밀번호 만료 | `ForbiddenException` | `403` | `PASSWORD_CHANGE_REQUIRED` |
| 약관 미동의 | `ForbiddenException` | `403` | `TERMS_AGREEMENT_REQUIRED` |
| personal 리소스 owner 불일치 | `ForbiddenException` | `403` | 접근 권한 없음 |
| permission 부족 | `ForbiddenException` | `403` | 권한 체크 실패 |

## 프론트 분기

`useAuth`가 `/auth/me` 응답을 판정하고, 라우트는 그 상태를 기준으로 화면을 분기한다.

`/auth/me` 호출 결과가 `403`이면, 프론트는 `error.code`를 기준으로 화면을 분기한다.

| `error.code` | 화면 분기 | 의미 |
|---|---|---|
| `TERMS_AGREEMENT_REQUIRED` | 약관 동의 화면 | 최신 약관에 미동의 |
| `PASSWORD_CHANGE_REQUIRED` | 비밀번호 변경 화면 | 비밀번호 만료 |
| `DORMANT_ACCOUNT` | 로그아웃 | 휴면 계정 |
| `INACTIVE_ACCOUNT` | 로그아웃 | 계정 비활성 |
| `INACTIVE_MEMBER` | 로그아웃 | 회원 비활성 |
| `INACTIVE_ORGANIZATION` | 로그아웃 | 조직 비활성 |

- 약관 동의와 비밀번호 변경만 별도 화면으로 보낸다.
- 그 외 `403`은 세션을 정리하고 로그아웃 처리한다.
- 약관 동의 성공 후에는 `useAuth`의 재검증을 다시 돌려서 상태를 갱신한다.

## 바이패스 케이스

바이패스는 `AuthGuard`의 일부 정책만 예외로 두는 용도다. 인증 자체를 없애는 것은 아니다.

| 바이패스 | 허용되는 엔드포인트 | 의미 |
|---|---|---|
| `BYPASS_POLICIES.TERMS` | `POST /auth/login`, `GET /auth/terms`, `POST /auth/terms/agreements` | 약관 미동의 상태에서도 해당 요청은 처리 가능 |
| `BYPASS_POLICIES.PASSWORD` | `POST /auth/password/change`, `POST /auth/password/defer` | 비밀번호 만료 상태에서도 해당 요청은 처리 가능 |

## 라우터 이동

| 위치 | 방식 | 조건 | 이동 대상 |
|---|---|---|---|
| `web/platform-admin-web/src/routes/_public/index.tsx` | `throw redirect()` | `/` 진입 | `/login` |
| `web/platform-admin-web/src/routes/_public.tsx` | `throw redirect()` | `isAuthenticated` | `/dashboard` |
| `web/platform-admin-web/src/routes/_protected.tsx` | `throw redirect()` | 미인증 | `/login` |
| `web/platform-admin-web/src/routes/_protected.tsx` | `throw redirect()` | `isPasswordExpired` | `/change-password` |
| `web/platform-admin-web/src/routes/_protected.tsx` | `throw redirect()` | `needsTermsAgreement`이고 `/agreement`가 아닐 때 | `/agreement` |
| `web/platform-admin-web/src/routes/_protected.tsx` | `throw redirect()` | `!needsTermsAgreement`이고 `/agreement`에 있을 때 | `/dashboard` |
| `web/platform-admin-web/src/routes/_public/login.tsx` | `<Navigate />` | 로그인 후 `isAuthenticated && !isInitializing` | `redirect` 쿼리 또는 `/dashboard` |
| `web/platform-admin-web/src/routes/_protected/change-password.tsx` | `<Navigate />` | `!isAuthenticated` | `/login` |
| `web/platform-admin-web/src/routes/_public/forgot-password.tsx` | 없음 | 비밀번호 재설정 안내 화면 | 직접 진입 가능 |
| `web/platform-admin-web/src/routes/_protected/agreement.tsx` | `navigate()` | 약관 동의 성공 후 | `/dashboard` |

## 읽는 법

- `AuthGuard`와 로그인 핸들러가 같은 공통 메시지 정의를 사용한다.
- 위반 코드와 메시지 매핑은 `auth-policy.errors.ts`에 모여 있다.
- `AuthGuard`는 `/auth/me`도 막는다.
- 약관 동의 여부는 `ContextMiddleware`가 직접 계산한 `terms` CLS 스냅샷 배열을 사용한다.
- 따라서 프론트는 `useAuth`가 만든 인증 상태를 기준으로 약관 동의, 비밀번호 변경 화면만 분기하고, 나머지는 로그아웃한다.

- `accountStatus`, `memberStatus`, `organizationStatus` 는 코드 변수명이다.
- `계정 활성 상태`, `회원 활성 상태`, `조직 활성 상태`, `휴면 상태`, `비밀번호 만료 상태` 는 상태 항목이다.
- `ACTIVE`, `INACTIVE`, `PENDING`, `REJECTED` 는 계정/회원/조직 상태 항목에 들어갈 수 있는 실제 값이다.
- `true`, `false` 는 휴면/비밀번호 만료 같은 boolean 항목의 실제 값이다.
- “계정 상태 차단” 같은 문장은 정책 설명이다.

## 정리된 의미

- `AuthGuard`는 로그인 이후 일반 요청을 차단한다.
- `LoginHandler`는 로그인 자체를 차단한다.
- 상태 판정 기준은 로그인 핸들러와 AuthGuard 내부 판정으로 통일했다.

## 현재 주의점

- 로그인은 `@Public()` 이므로 `AuthGuard`를 타지 않는다.
- 따라서 로그인은 가드가 아니라 로그인 핸들러 내부 판정을 직접 사용한다.
- 비밀번호 변경/연기에서의 중복 상태 검사는 제거했다.

## 확인 완료 항목

- [x] 상태 정책을 가드/핸들러로 분리
- [x] 공통 상태 판정 서비스 생성
- [x] 로그인 중복 상태 검사 제거
- [x] `platform-service` 린트 통과
