# 인증 API 완료 체크리스트

작성 기준: `service-gateway` + `platform-auth-service`의 플랫폼 인증 API

## 완료

- `POST /api/v1/auth/login`
  - 관리자 이메일/비밀번호 로그인
  - 이메일 정규화(`trim` + `lowercase`)
  - 로그인 실패 잠금 정책 적용
  - 로그인 성공 시 `accessToken`, `refreshToken`, `tenantId` 반환

- `POST /api/v1/auth/refresh`
  - refresh token 검증
  - Redis 저장값과 비교
  - token rotation 적용
  - 만료/불일치 시 `401` 반환

- `POST /api/v1/auth/logout`
  - refresh token 쿠키 제거
  - Redis에 저장된 세션 폐기

- `GET /api/v1/auth/me`
  - 현재 인증 관리자 정보 조회

- `GET /api/v1/auth/permissions`
  - 현재 관리자와 테넌트 기준 역할/권한 조회

- 인증 테스트
  - `platform-auth-service` 로그인/refresh/logout 테스트 추가
  - `platform-auth-service` permissions 테스트 추가
  - `service-gateway` auth controller/client 테스트 추가

- 문서 정합성
- 로그인 스펙을 관리자 이메일 기반으로 정리
  - 단일 테넌트 전제로 `select-tenant` 표현 제거

## 미완료

- `2FA`
- `invite/verify`

## 현재 전제

- 각 사용자는 하나의 테넌트에만 속한다.
- 로그인 시 추가 테넌트 선택 단계는 없다.
- `tenantId`는 현재 컨텍스트 식별용으로만 사용한다.

## 검증 상태

- `platform-auth-service` 테스트 통과
- `service-gateway` 테스트 통과
- 각 서비스 빌드 통과
