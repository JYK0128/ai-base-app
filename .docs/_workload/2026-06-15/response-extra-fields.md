# 비표준 응답 필드 정리 - 2026-06-15

## 목적

`apps/platform-service`에서 표준 응답 타입(`IdResponseDto`, `EntityResponseDto`, `ListResponseDto`, `PayloadResponseDto`)으로 정리되지 않은 response DTO의 필드를 정리한다.
여기서 `참조변수`는 응답을 만들 때 실제로 읽는 값 또는 조립 경로를 의미한다.

## 작업 기준

- 표준 entity/list/id/payload 필드는 제외한다.
- getter, relation, aggregate, session snapshot처럼 응답 조립에 필요한 커스텀 필드만 남긴다.
- 같은 DTO가 여러 계약에서 재사용되더라도 대표 계약 기준으로 1회만 기록한다.

## 인증 응답 필드

| 도메인 | 기능 | 기능상세 | DTO | 필드명 | entity getter 여부 | 참조변수 | 설명 | 근거 파일 |
|---|---|---|---|---|---|---|---|---|
| 인증 | 생성 | 단건 | `AuthLoginResponseDto` | `accessToken` | X | `tokens.accessToken` | 액세스 토큰이다. | [`login.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/login/login.response.dto.ts) |
| 인증 | 생성 | 단건 | `AuthLoginResponseDto` | `refreshToken` | X | `tokens.refreshToken` | 리프레시 토큰이다. | [`login.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/login/login.response.dto.ts) |
| 인증 | 재발급 | 단건 | `AuthRefreshTokenResponseDto` | `accessToken` | X | `tokens.accessToken` | 액세스 토큰이다. | [`refresh-token.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/refresh-token/refresh-token.response.dto.ts) |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `account` | X | `account` | 계정 정보이다. | [`get-me.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/me/get-me.response.dto.ts) |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `member` | X | `member` | 멤버 정보이다. | [`get-me.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/me/get-me.response.dto.ts) |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `organization` | X | `organization` | 조직 정보이다. | [`get-me.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/me/get-me.response.dto.ts) |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `permissions` | X | `permissions` | 권한 코드 목록이다. | [`get-me.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/me/get-me.response.dto.ts) |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `agreedTermsVersionIds` | X | `agreedTermsVersionIds` | 현재 동의한 약관 버전 식별자 목록이다. | [`get-me.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/me/get-me.response.dto.ts) |
| 인증 | 조회 | 단건 | `AuthGetMeResponseDto` | `mustAcceptTerms` | X | `mustAcceptTerms` | 약관 재동의 필요 여부이다. | [`get-me.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/me/get-me.response.dto.ts) |
## 관계 추출 응답 필드

| 도메인 | 기능 | 기능상세 | DTO | 필드명 | entity getter 여부 | 참조변수 | 설명 | 근거 파일 |
|---|---|---|---|---|---|---|---|---|
| 지원 | 조회 | 복수 | `GetTicketResponseDto` | `organization` | X | `ticket.organization.id` | 티켓 소속 조직 식별자이다. | [`get-ticket-page.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/support/get-ticket-page/get-ticket-page.response.dto.ts) |
| 약관 | 조회 | 단건 | `GetTermsDocumentResponseDto` | `organization` | X | `document.organization.id` | 조직별 약관일 때 조직 식별자이다. | [`get-terms-document.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/terms/get-terms-document/get-terms-document.response.dto.ts) |
| 약관 | 조회 | 단건 | `GetTermsDocumentDetailResponseDto` | `document` | X | `document` | 문서 기본 정보이다. | [`get-terms-document.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/terms/get-terms-document/get-terms-document.response.dto.ts) |
| 약관 | 조회 | 단건 | `GetTermsDocumentDetailResponseDto` | `versions` | X | `versions` | 버전 목록이다. | [`get-terms-document.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/terms/get-terms-document/get-terms-document.response.dto.ts) |
| 약관 | 조회 | 단건 | `GetTermsDocumentDetailResponseDto` | `currentVersion` | X | `currentVersion` | 현재 효력 버전이다. | [`get-terms-document.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/terms/get-terms-document/get-terms-document.response.dto.ts) |
| 리소스 | 조회 | 복수 | `GetResourceResponseDto` | `parent` | X | `resource.parent.id` | 부모 리소스 식별자이다. | [`get-resource-page.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/resource/get-resource-page/get-resource-page.response.dto.ts) |
| 리소스 | 조회 | 복수 | `GetResourceResponseDto` | `children` | X | `children` | 하위 리소스 목록이다. | [`get-resource-page.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/resource/get-resource-page/get-resource-page.response.dto.ts) |
| 멤버 | 조회 | 단건 | `GetMemberResponseDto` | `roles` | X | `member.roles.getItems().map((ra) => ra.role.code)` | 대표 역할 코드 목록이다. | [`get-member.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/members/get-member/get-member.response.dto.ts) |
| 멤버 | 조회 | 단건 | `GetMemberResponseDto` | `lastLoginAt` | X | `member.accounts.getItems()[0]?.lastLoginAt` | 최근 로그인 일시이다. | [`get-member.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/members/get-member/get-member.response.dto.ts) |
| 권한 | 조회 | 단건 | `GetPermissionSetResponseDto` | `permissions` | X | `role.permissions.getItems()` | 권한 코드 목록이다. | [`get-permission-sets.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/resource/get-permission-sets/get-permission-sets.response.dto.ts) |

## 비표준 응답 필드

| 도메인 | 기능 | 기능상세 | DTO | 필드명 | entity getter 여부 | 참조변수 | 설명 | 근거 파일 |
|---|---|---|---|---|---|---|---|---|
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `category` | O | `metadata.category` | 공지 분류이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `audience` | O | `metadata.audience` | 공지 대상이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `channel` | O | `metadata.channel` | 공지 채널이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `priority` | O | `metadata.priority` | 공지 우선순위이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `pinned` | O | `metadata.pinned` | 상단 고정 여부이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `publishedAt` | O | `metadata.publishedAt` | 게시 확정 일시이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `startAt` | O | `metadata.startAt` | 게시 시작일이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `endAt` | O | `metadata.endAt` | 게시 종료일이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `status` | O | `metadata.publishedAt`, `metadata.startAt`, `metadata.endAt` | 게시 상태이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `isPublished` | O | `metadata.publishedAt` | 게시 확정 여부이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `author` | O | `createdBy`, `updatedBy` | 작성자이다. | [`announcement.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/announcement/announcement.entity.ts) |
| 리소스 | 조회 | 단건 | `GetResourceResponseDto` | `actions` | O | `metadata.creatable`, `metadata.readable`, `metadata.updatable`, `metadata.deletable` | 리소스 액션 목록이다. | [`get-resource.response.dto.ts`](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/resource/get-resource/get-resource.response.dto.ts) |
| 약관 | 조회 | 단건 | `GetTermsDocumentResponseDto` | `status` | O | `metadata.publishedAt`, `metadata.terminatedAt` | 약관 상태이다. | [`terms-document.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/terms/terms-document.entity.ts) |
| 약관 | 조회 | 단건 | `GetTermsDocumentResponseDto` | `terminatedAt` | O | `metadata.terminatedAt` | 종료 일시이다. | [`terms-document.entity.ts`](/Users/server/Documents/GitHub/ai-base-app/packages/database/src/domains/platform/terms/terms-document.entity.ts) |
