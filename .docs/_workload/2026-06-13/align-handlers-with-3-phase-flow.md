# Align Handlers with 3-Phase Flow - 2026-06-13

## 📋 작업 체크리스트
- [x] platform-service 내 미준수 Command 핸들러 5개 전수 리팩토링
  - `ApproveOrganizationHandler` 리팩토링 및 @Transactional 적용
  - `RefreshTokenHandler` 리팩토링 및 @Transactional 적용
  - `LoginHandler` 리팩토링 및 validatePolicies 통합
  - `SendInviteEmailHandler` 리팩토링 및 @Transactional 적용
  - `CreateInviteHandler` 리팩토링 및 validatePolicies 적용
  - 시작: 2026-06-13 09:27
  - 완료: `844c9bc`
- [x] platform-service 타입 체크 및 린트 검증 수행
  - 시작: 2026-06-13 09:27
  - 완료: `844c9bc`
