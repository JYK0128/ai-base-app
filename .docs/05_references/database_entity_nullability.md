# 데이터베이스 엔티티 Nullability 기준

## 1. 기준 목적

- `packages/database` 엔티티와 임베더블의 nullable 표기를 통일함
- DB 저장 의미와 TypeScript 타입 의미를 분리해서 관리함

## 2. 표기 규칙

- `T | null = null`
  - nullable 저장 필드의 기본 표기
  - DB 값이 없음을 `null`로 표현함
  - 초기값을 명시적으로 `null`로 둠
- `Opt<T>`
  - 기본값이 있는 상태 필드에 사용함
  - nullable 의미로 사용하지 않음
  - 예: enum 상태값, boolean 플래그, 내부 메타데이터 객체
- `?: T`
  - 선택적 객체 상태를 표현함
  - nullable 저장 필드 표현에는 사용하지 않음

## 3. 관계 필드 기준

- `ManyToOne(..., { nullable: true })` 관계는 현재 엔티티 구조에 맞춰 별도 판단함
- 관계 필드의 객체 존재 여부와 DB nullable 의미를 분리해서 본다
- 관계 필드 타입 정리는 저장 필드와 별개로 처리한다

## 4. 현재 적용 예시

- `AnnouncementMetadata.publishedAt: Date | null = null`
- `AnnouncementMetadata.startAt: Date | null = null`
- `AnnouncementMetadata.endAt: Date | null = null`
- `MemberInviteMetadata.sentAt: Date | null = null`
- `MemberInviteMetadata.failedAt: Date | null = null`
- `MemberInviteMetadata.cancelAt: Date | null = null`
- `MemberInviteMetadata.acceptedAt: Date | null = null`
- `MemberInviteMetadata.rejectedAt: Date | null = null`
- `MemberInviteMetadata.expiredAt: Date | null = null`
- `Resource.sortOrder: number | null = null`
- `I18nLocale.sortOrder: number | null = null`
- `OrganizationRole.sortOrder: number | null = null`
- `OrganizationMetadata.approvedAt: Date | null = null`
- `OrganizationMetadata.deactivatedAt: Date | null = null`
- `OrganizationMetadata.rejectedAt: Date | null = null`
- `TermsDocumentMetadata.publishedAt: Date | null = null`
- `TermsDocumentMetadata.terminatedAt: Date | null = null`

## 5. 검증 기준

- 엔티티 수정 후 `@pkg/database build`를 실행함
- `metadata.json`과 `dist/index.d.ts`를 갱신함
- 타입 검사와 린트를 함께 확인함

## 6. 관련 작업 기록

- [`entity-optional-null-audit.md`](/Users/server/Documents/GitHub/ai-base-app/.docs/_workload/2026-07-07/entity-optional-null-audit.md)
- [`entity-nullable-field-standardization.md`](/Users/server/Documents/GitHub/ai-base-app/.docs/_workload/2026-07-07/entity-nullable-field-standardization.md)

## 7. 필수값 분류

- `?: T` 필드
  - 현재 기준에서 모두 비필수값으로 분류함
  - 공통 책임
    - `CoreEntity` 공통 감사 필드: `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`, `metadata`
- 관계 선택 필드: `Resource.parent`, `SupportTicket.assignedTo`, `TermsDocument.organization`
- 선택 스칼라 필드: `Resource.path`, `Resource.icon`, `I18nLocale.regionCode`, `MemberInvite.note`, `MemberAccount.lastLoginAt`, `MemberAccount.lastLoginIp`, `OrganizationRole.description`
- `T | null = null` 필드
  - 현재 기준에서 비필수값으로 분류함
  - 값 부재를 `null`로 저장하고, 초기 상태를 `null`로 고정함
  - 적용 대상: `AnnouncementMetadata.startAt`, `AnnouncementMetadata.endAt`, `Resource.sortOrder`, `I18nLocale.sortOrder`, `OrganizationRole.sortOrder`
- `Opt<T>` 필드
  - 기본값을 가진 상태값으로 분류함
  - 필수 입력값으로 사용하지 않음
- 필수값 케이스
  - 현재 정리된 nullable/optional 저장 필드 기준에서는 별도 필수값 케이스가 없음
