# 로그인 및 비밀번호 변경 기능명세서

## 1. 개요

* 플랫폼 어드민 포털 진입을 위한 인증 관문이다.
* 인증 방식은 `sid` `HttpOnly` 쿠키 기반 세션이다.
* 상태 변경 요청은 `x-csrf-token` 헤더를 함께 보내야 한다.
* 클라이언트는 토큰을 저장하지 않으며, `/auth/me` 조회 결과와 `authStatus` 상태 머신으로 화면을 분기한다.
* 구현 파일 경로:
  * 로그인: `web/platform-admin-web/src/routes/_public/login.tsx`
  * 비밀번호 변경: `web/platform-admin-web/src/routes/_protected/change-password.tsx`
  * 약관 동의: `web/platform-admin-web/src/routes/_protected/agreement.tsx`

## 2. 라우트 정보

| 항목 | 로그인 화면 | 비밀번호 변경 화면 | 약관 동의 화면 |
| --- | --- | --- | --- |
| 경로 | `/login` | `/change-password` | `/agreement` |
| 노출 위치 | Public | Protected special route | Protected special route |
| 접근 조건 | 누구나 접근 | `authStatus = password_change_required` 또는 세션 유지 상태 | `authStatus = terms_agreement_required` 또는 세션 유지 상태 |

## 3. 목적

| 목적 | 설명 |
| --- | --- |
| 세션 수립 | 이메일/비밀번호 검증 성공 시 서버가 `sid` 세션을 생성하고 쿠키를 발급한다. |
| 정책 분기 | 비밀번호 만료와 약관 미동의는 세션을 유지한 채 별도 화면으로 분기한다. |
| CSRF 갱신 | 로그인/로그아웃/세션 만료 이후에는 `/auth/csrf`로 새 토큰을 다시 발급한다. |
| 세션 복구 | 새로고침 또는 초기 진입 시 `/auth/me` 결과로 인증 상태를 복구한다. |

## 4. 화면 구성

### 4.1 로그인 화면

* 이메일 입력 필드
* 비밀번호 입력 필드
* 로그인 단추
* 비밀번호 찾기, 계정 생성 안내 링크

### 4.2 비밀번호 변경 화면

* 이전 화면 이동 단추
* 현재 비밀번호 입력 필드
* 새 비밀번호 입력 필드
* 새 비밀번호 확인 필드
* 비밀번호 변경 단추

### 4.3 약관 동의 화면

* 동의 대기 약관 목록
* 약관 상세 확인
* 개별/전체 동의 단추

## 5. 데이터 모델

### 5.1 인증 세션 상태

| 필드 | 설명 |
| --- | --- |
| `sid` | 서버가 발급하는 세션 식별자 쿠키 |
| `authStatus` | `initializing`, `anonymous`, `authenticated`, `password_change_required`, `terms_agreement_required`, `revoked` 중 하나 |
| `sessionLoaded` | `/auth/me` 조회 완료 여부 |
| `permissions` | 메뉴 접근 제어에 사용하는 권한 코드 목록 |
| `passwordPolicy` | 비밀번호 만료 상태와 만료 시점 스냅샷 |
| `termsPolicy` | 약관 재동의 필요 여부와 미동의 버전 목록 |

## 6. 기능 상세

### 6.1 로그인 흐름

* 사용자가 이메일과 비밀번호를 제출한다.
* 프론트는 제출 전에 `/auth/csrf`를 통해 발급받은 토큰을 `x-csrf-token` 헤더로 포함한다.
* 백엔드는 자격 증명 검증 후 세션을 생성하고 `sid` 쿠키를 설정한다.
* 프론트는 응답 본문이 아니라 `/auth/me` 재조회 결과를 기준으로 상태를 갱신한다.
* 세션이 `password_change_required`이면 `/change-password`로 이동한다.
* 세션이 `terms_agreement_required`이면 `/agreement`로 이동한다.
* 그 외 정상 세션이면 `/dashboard`로 이동한다.

### 6.2 비밀번호 변경

* 비밀번호 변경 성공 시 세션은 유지한다.
* 변경 후 세션 정책이 다시 계산된다.
* 프론트는 `revalidateAuth()`로 `/auth/me`를 다시 읽고 다음 화면을 결정한다.

### 6.3 약관 동의

* 약관 동의 완료 후 세션 정책이 다시 계산된다.
* 미동의 상태가 해소되면 `/dashboard`로 이동한다.

## 7. 상태 판정 규칙

| 판정 기준 | UI 동작 |
| --- | --- |
| `authStatus = authenticated` 상태로 `/login` 진입 | `/dashboard`로 리다이렉트 |
| `authStatus = password_change_required` | `/change-password`로 리다이렉트 |
| `authStatus = terms_agreement_required` | `/agreement`로 리다이렉트 |
| `authStatus = anonymous` 또는 `revoked` | `/login` 유지 또는 `/login`으로 리다이렉트 |

## 8. 입력 검증

### 8.1 로그인

* 이메일: 필수, 이메일 형식 검증
* 비밀번호: 필수, 최소 1자

### 8.2 비밀번호 변경

* 현재 비밀번호: 필수
* 새 비밀번호: 필수, 최소 6자
* 새 비밀번호 확인: 필수, 새 비밀번호와 일치해야 함

## 9. 사용자 피드백

| 상황 | 피드백 |
| --- | --- |
| 로그인 중 | 제출 버튼 비활성화 |
| 비밀번호 변경 중 | 제출 버튼 비활성화 |
| 약관 동의 중 | 동의 버튼 비활성화 |
| 세션 만료 | `anonymous`로 전환 후 로그인 화면으로 복귀 |

## 10. API 연동 기준

| 기능 | Method | Endpoint | 비고 |
| --- | --- | --- | --- |
| CSRF 토큰 발급 | `GET` | `/api/v1/auth/csrf` | 상태 변경 요청 전 토큰 재발급 |
| 로그인 | `POST` | `/api/v1/auth/login` | 성공 시 `sid` 쿠키 설정 |
| 내 세션 조회 | `GET` | `/api/v1/auth/me` | 세션 기반 사용자 정보 반환 |
| 비밀번호 변경 | `POST` | `/api/v1/auth/password/change` | 세션 유지 후 정책 재계산 |
| 약관 동의 | `POST` | `/api/v1/auth/terms/agreements` | 세션 유지 후 정책 재계산 |
| 로그아웃 | `POST` | `/api/v1/auth/logout` | 서버 세션 삭제 및 `sid`/CSRF 쿠키 만료 |

---
*최종 업데이트: 2026-06-21*
