# B2B Auth Service 상세 사양서 (MVP Edition)

## 1. 개요

조직(Organization) 파업너 및 운영 매니저의 권한 관리와 보안 인증을 담당합니다.

## 2. 권한 및 보안 모델 (RBAC)

* **표준 역할(Role)**: `SuperAdmin` (플랫폼 운영), `OrgAdmin` (파트너 관리자), `OrgManager` (현장 실무자).
* **MFA (Multi-Factor Authentication)**: 보안을 위해 이메일 OTP 또는 TOTP 2차 인증을 필수로 설정합니다.
* **Audit Logging**: 매니저의 권한 변경 및 설정 조회 이력을 상세 기록합니다.

## 3. 주요 관리 기능

* **계정 초대**: 파트너가 자사 직원을 시스템에 이메일로 초대하고 역할을 부여합니다.
* **대리 로그인 (Login-As)**: 플랫폼 운영진이 파트너의 상황을 기술 지원하기 위해 일시적인 매니저 권한을 획득합니다 (감사 로그 필수 기록).
* **로그인 보안 정책**: 비밀번호 복잡도 강제 및 일정 횟수 실패 시 계정 잠금 기능.

## 4. 핵심 API 명세

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | 관리자 이메일/비번 기반 로그인 |
| `POST` | `/auth/mfa/verify` | 2차 인증 코드 검증 |
| `POST` | `/organizations/invite` | 신규 매니저 초대장 발급 (이메일 발송) |
| `GET` | `/audit/access-logs` | 보안 감사용 접속 이력 조회 |
