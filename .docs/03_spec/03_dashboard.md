# 대시보드 메뉴 기능명세서 (FE)

## 1. 개요

* 로그인된 관리자가 가장 먼저 진입하는 보호 영역 허브 화면이다.
* 세션 상태 확인, 보호된 서비스 접근, 안전한 로그아웃을 제공한다.
* 구현 파일: `web/platform-admin-web/src/routes/_protected/dashboard/index.tsx`

## 2. 메뉴 식별 정보

| 항목 | 값 |
| --- | --- |
| 메뉴명 | 대시보드 |
| 리소스 코드 | `DASHBOARD` |
| 리소스 유형 | `MENU` |
| 리소스 범위 | `ORGANIZATION` |
| 경로 | `/dashboard` |
| 아이콘 | `LayoutDashboard` |
| 기본 권한 | `READ` |

## 3. 메뉴 목적

| 목적 | 설명 |
| --- | --- |
| 세션 인증 확인 | `/auth/me` 기반 세션 상태가 `authenticated`인지 확인한다. |
| 세션 제어 및 로그아웃 | 서버 세션 삭제 후 로그인 화면으로 복귀한다. |

## 4. 화면 구성

### 4.1 대시보드 메인 영역

* 헤더
* 로그인 상태 카드
* 로그아웃 단추

## 5. 데이터 모델

### 5.1 세션 및 계정

* `authStatus`: 현재 세션 상태
* `sessionLoaded`: `/auth/me` 조회 완료 여부
* `permissions`: 메뉴 접근 권한 코드 목록
* `accountId`, `memberId`, `organizationId`: 현재 세션의 식별자

## 6. 기능 상세

### 6.1 로그인 세션 유효성 시각화

* `/dashboard` 정상 진입은 `_protected.tsx` 라우트 가드가 `authStatus = authenticated`를 허용하는 것을 전제한다.
* 세션이 만료되거나 삭제되면 로그인 화면으로 리다이렉트된다.

### 6.2 세션 폐기 및 리디렉션

* `Logout` 클릭 시 `useAuth().logout()`이 호출된다.
* 서버는 세션을 삭제하고 `sid` 쿠키를 만료한다.
* 프론트는 로그인 화면으로 이동한다.

## 7. 상태 판정 규칙

| 판정 기준 | UI 표시 상태 |
| --- | --- |
| `authStatus = authenticated` | 로그인 완료 |
| `authStatus = password_change_required` | 변경 필요 상태로 보호 라우트 재분기 |
| `authStatus = terms_agreement_required` | 약관 동의 화면으로 재분기 |
| `authStatus = anonymous` 또는 `revoked` | 로그인 화면으로 강제 리다이렉트 |

## 8. 입력 검증

* 별도 입력 폼 없음

## 9. 사용자 피드백

| 상황 | 피드백 |
| --- | --- |
| 로그아웃 클릭 | 즉시 세션 삭제 후 로그인 화면으로 이동 |

## 10. API 연동 기준

| 기능 | Method | Endpoint | 비고 |
| --- | --- | --- | --- |
| 세션 조회 | `GET` | `/api/v1/auth/me` | 현재 세션 정보 반환 |
| 로그아웃 | `POST` | `/api/v1/auth/logout` | 서버 세션 삭제 및 `sid`/CSRF 쿠키 만료 |

---
*최종 업데이트: 2026-06-21*
