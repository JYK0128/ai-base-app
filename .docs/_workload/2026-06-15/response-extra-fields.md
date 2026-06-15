# 비표준 응답 필드 정리 - 2026-06-15

## 목적

`apps/platform-service`에서 표준 응답 타입(`IdResponseDto`, `EntityResponseDto`, `ListResponseDto`, `PayloadResponseDto`)으로 정리되지 않은 response DTO의 필드를 정리한다.
여기서 `참조변수`는 응답을 만들 때 실제로 읽는 값 또는 조립 경로를 의미한다.

## 작업 기준

- 표준 entity/list/id/payload 필드는 제외한다.
- getter, relation, aggregate, session snapshot처럼 응답 조립에 필요한 커스텀 필드만 남긴다.
- 같은 DTO가 여러 계약에서 재사용되더라도 대표 계약 기준으로 1회만 기록한다.

## 비표준 응답 필드

| 도메인 | 기능 | 기능상세 | DTO | 필드명 | 참조변수 | 설명 |
|---|---|---|---|---|---|---|
| 인증 | 생성 | 단건 | `AuthLoginResponseDto` | `accessToken` | `tokens.accessToken` | 액세스 토큰이다. |
| 인증 | 생성 | 단건 | `AuthLoginResponseDto` | `refreshToken` | `tokens.refreshToken` | 리프레시 토큰이다. |
| 인증 | 생성 | 단건 | `AuthRefreshTokenResponseDto` | `accessToken` | `tokens.accessToken` | 액세스 토큰이다. |
| 인증 | 생성 | 단건 | `AuthRefreshTokenResponseDto` | `refreshToken` | `tokens.refreshToken` | 리프레시 토큰이다. |
| 인증 | 생성 | 단건 | `AuthRefreshTokenResponseDto` | `id` | `account.id` | 계정 식별자이다. |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `account` | `account` | 계정 정보이다. |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `member` | `member` | 멤버 정보이다. |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `organization` | `organization` | 조직 정보이다. |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `permissions` | `permissions` | 권한 코드 목록이다. |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `agreedTermsVersionIds` | `agreedTermsVersionIds` | 현재 동의한 약관 버전 식별자 목록이다. |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `mustAcceptTerms` | `mustAcceptTerms` | 약관 재동의 필요 여부이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `category` | `metadata.category` | 공지 분류이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `audience` | `metadata.audience` | 공지 대상이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `channel` | `metadata.channel` | 공지 채널이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `priority` | `metadata.priority` | 공지 우선순위이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `pinned` | `metadata.pinned` | 상단 고정 여부이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `publishedAt` | `metadata.publishedAt` | 게시 확정 일시이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `startAt` | `metadata.startAt` | 게시 시작일이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `endAt` | `metadata.endAt` | 게시 종료일이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `isPublished` | `announcement.isPublished` | 게시 확정 여부이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `author` | `announcement.createdBy ?? announcement.updatedBy` | 작성자이다. |
| 멤버 | 조회 | 단건 | `GetMemberResponseDto` | `email` | `member.accounts.getItems()[0]?.email` | 대표 계정 이메일이다. |
| 멤버 | 조회 | 단건 | `GetMemberResponseDto` | `role` | `member.roles.getItems()[0]?.role.code` | 대표 역할 코드이다. |
| 멤버 | 조회 | 단건 | `GetMemberResponseDto` | `lastLoginAt` | `member.accounts.getItems()[0]?.lastLoginAt` | 최근 로그인 일시이다. |
| 멤버 | 조회 | 단건 | `GetMemberResponseDto` | `invitedAt` | `member.createdAt` | 초대 일시이다. |
| 권한 | 조회 | 단건 | `GetPermissionSetResponseDto` | `assignmentCount` | `role.assignments.getItems().length` | 배정된 관리자 수이다. |
| 권한 | 조회 | 단건 | `GetPermissionSetResponseDto` | `permissionCodes` | `role.permissions.getItems()` | 권한 코드 목록이다. |
| 리소스 | 조회 | 단건 | `GetResourceResponseDto` | `parent` | `resource.parent.id` | 부모 리소스 식별자이다. |
| 리소스 | 조회 | 단건 | `GetResourceResponseDto` | `children` | `children` | 하위 리소스 목록이다. |
| 지원 | 조회 | 복수 | `GetTicketResponseDto` | `organizationId` | `ticket.organization.id` | 티켓 소속 조직 식별자이다. |
| 약관 | 생성 | 단건 | `CreateTermsAgreementResponseDto` | `agreed` | `consent.agreed` | 동의 여부이다. |
| 약관 | 생성 | 단건 | `CreateTermsAgreementResponseDto` | `agreedAt` | `consent.createdAt` | 동의 일시이다. |
| 약관 | 조회 | 단건 | `GetTermsDocumentResponseDto` | `organizationId` | `document.organization.id` | 조직별 약관일 때 조직 식별자이다. |
| 약관 | 조회 | 복수 | `GetTermsDocumentVersionResponseDto` | `versionLabel` | `version.label` | 버전 라벨이다. |
| 약관 | 조회 | 복수 | `GetTermsDocumentVersionResponseDto` | `effectiveAt` | `version.effectiveAt` | 효력 일시이다. |
| 약관 | 조회 | 단건 | `GetTermsDocumentDetailResponseDto` | `document` | `document` | 문서 기본 정보이다. |
| 약관 | 조회 | 단건 | `GetTermsDocumentDetailResponseDto` | `versions` | `versions` | 버전 목록이다. |
| 약관 | 조회 | 단건 | `GetTermsDocumentDetailResponseDto` | `currentVersion` | `currentVersion` | 현재 효력 버전이다. |
