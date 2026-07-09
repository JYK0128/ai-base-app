# 엔티티 Optional / Null 감사 노트 - 2026-07-07

## 📋 작업 요약

- 대상: `packages/database/src/**/entity.ts`, `packages/database/src/**/embeddable.ts`
- 정리 결과: nullable 저장 필드를 `T | null = null`로 통일
- 기준 문서: [`database_entity_nullability.md`](/Users/server/Documents/GitHub/ai-base-app/.docs/05_references/database_entity_nullability.md)

## 📋 조사 결과

- `?: T | null` 저장 필드
  - `AnnouncementMetadata.publishedAt`
  - `MemberInviteMetadata.sentAt`, `failedAt`, `cancelAt`, `acceptedAt`, `rejectedAt`, `expiredAt`
  - `OrganizationMetadata.approvedAt`, `deactivatedAt`, `rejectedAt`
- `Opt<T>` 단독 사용
  - 상태값, 플래그, 내부 메타데이터 기본값 필드
- `?: T`
  - 선택적 객체 상태 필드

## 📋 처리 상태

- 기준 문서 작성 완료
- 엔티티 nullable 필드 표준화 완료
- 빌드 및 타입 검사 완료
