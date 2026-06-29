# 인터페이스 표준 (요약)

## 1. 통신 및 기본 규격

* **표준**: HTTPS / RESTful API / JSON (UTF-8)
* **버저닝**: `/api/v1/...` 형태의 URL Path 기반 관리

## 2. 공통 헤더

* `Authorization`: Bearer JWT 토큰
* `X-Tenant-ID`: 테넌트 식별 및 데이터 격리 기준값
* `X-Request-ID`: 전 구간 트랜잭션 추적용 UUID

## 3. 표준 응답 구조 (Envelope)

* **성공**: `{"success": true, "issueId": "...", "topicId": "...", "timestamp": "...", "data": {...}, "detail": null, code: "...", "message": "..."}`
* **실패**: `{"success": false, "issueId": "...", "topicId": "...", "timestamp": "...", "data": null, "detail": {...}, code: "...", "message": "..."}`

## 4. HTTP 상태 코드 가이드

* **200/201**: 요청 성공 및 리소스 생성
* **400/404**: 클라이언트 요청 오류(파라미터/리소스 부재)
* **401/403**: 보안 인증 실패 및 접근 권한 부족
* **429/500**: 서비스 요청 초과(Rate Limit) 및 서버 내부 오류

## 5. Page/List 응답 DTO 조사 결과

> 조사 기준: `apps/platform-service/src/domains/**/**/*.response.dto.ts`

### 5.1 Page 응답

| File | Wrapper | Row DTO | 비고 |
| --- | --- | --- | --- |
| `member/get-member-page.response.dto.ts` | `GetMemberPageResponseDto` | `MemberPageItem` | page 전용 row DTO |
| `announcement/get-announcement-page.response.dto.ts` | `GetAnnouncementPageResponseDto` | `AnnouncementPageItem` | page 전용 row DTO |
| `support/get-ticket-page.response.dto.ts` | `GetTicketPageResponseDto` | `GetTicketPageItem` | page 전용 row DTO |

### 5.2 List 응답

| File | Wrapper | Row DTO | 비고 |
| --- | --- | --- | --- |
| `resource/get-resource-list.response.dto.ts` | `GetResourceListResponseDto` | `GetResourceListItem` | list 전용 row DTO |
| `organization/get-organization-list.response.dto.ts` | `GetOrganizationListResponseDto` | `OrganizationListItem` | list 전용 row DTO |
| `i18n/locale-list/get-locale-list.response.dto.ts` | `GetLocaleListResponseDto` | `LocaleListItem` | list 전용 row DTO |
| `auth/allowed-resource-list/allowed-resource-list.response.dto.ts` | `AllowedResourceListResponseDto` | `AllowedResourceListItem` | list 전용 row DTO |
| `auth/pending-term-list/pending-term-list.response.dto.ts` | `PendingTermListResponseDto` | `PendingTermListItem` | list 전용 row DTO |
| `resource/get-role-permission-list/get-role-permission-list.response.dto.ts` | `GetRolePermissionListResponseDto` | `RolePermissionListItem` | list 전용 row DTO |
| `organization/organization-role-list/get-organization-role-list.response.dto.ts` | `GetOrganizationRoleListResponseDto` | `OrganizationRoleListItem` | list 전용 row DTO |
| `term/get-term-document/get-term-document.response.dto.ts` | `GetTermDocumentListResponseDto` | `GetTermDocumentItem` | list 전용 row DTO |
| `term/get-term-document/get-term-document.response.dto.ts` | `GetTermDocumentVersionListResponseDto` | `GetTermDocumentVersionItem` | list 전용 row DTO |

### 5.3 요약

| 구분 | 관찰 결과 |
| --- | --- |
| wrapper 이름 | `PageResponseDto` / `ListResponseDto` 계열은 대체로 일관됨 |
| row DTO 이름 | page/list 전용 row DTO는 `Item` suffix로 통일됨 |
| 예외 | detail 응답 DTO는 여전히 `ResponseDto` suffix를 유지함 |
| 추가 검토 대상 | `term` detail 응답은 내부에 `Item`을 재사용하는 구조임 |
| 정리 우선순위 | page/list row DTO naming은 `Item` 기준으로 정리 완료 |
