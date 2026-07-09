# 엔티티 Nullable 필드 표준화 - 2026-07-07

## 📋 작업 체크리스트

- [x] `?: T | null` 저장 필드 선언을 `T | null = null`로 통일
  - 시작: 2026-07-07 14:19
  - 완료: `[verified]`
- [x] `@pkg/database` 빌드 및 타입 정합성 확인
  - 시작: 2026-07-07 14:19
  - 완료: `[verified]`
- [x] 변경 범위 내 잔여 `?: T | null` 참조 확인
  - 시작: 2026-07-07 14:19
  - 완료: `[verified]`

## 📋 정리 결과

- nullable 저장 필드 표기를 `T | null = null`로 통일함
- 작업 기준은 [`database_entity_nullability.md`](/Users/server/Documents/GitHub/ai-base-app/.docs/05_references/database_entity_nullability.md)로 이동함
- 반영 대상
  - `AnnouncementMetadata.publishedAt`
  - `MemberInviteMetadata.sentAt`, `failedAt`, `cancelAt`, `acceptedAt`, `rejectedAt`, `expiredAt`
  - `OrganizationMetadata.approvedAt`, `deactivatedAt`, `rejectedAt`
