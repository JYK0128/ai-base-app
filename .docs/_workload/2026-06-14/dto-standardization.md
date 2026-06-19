# DTO 표준화 기준 - 2026-06-14

## 목적

`apps/platform-service`의 request / response / contract 구조를 이 문서를 기준으로 분류하고 수정한다.

## 기본 원칙

- request는 `IdRequestDto`, `EntityRequestDto`, `ListRequestDto`, `PageRequestDto`, `FilterRequestDto`, `PayloadRequestDto` 중 하나를 따른다.
- response는 `IdResponseDto`, `EntityResponseDto`, `ListResponseDto`, `PayloadResponseDto`를 우선 사용한다.
- 단건조회는 `id` 기반 request를 사용한다.
- 단건갱신은 대상 식별 + payload 조합이 아닌, 가능한 경우 표준 request DTO로 분리한다.
- inline object, raw string, 임의 Pick 조합은 표준 DTO로 치환한다.
- `get-me`, `detail`, `tree`, `aggregate`처럼 가공 응답이 필요한 경우만 커스텀 DTO를 허용한다.

## 인증 계약표

| 분류 | 기능 | 기능상세 | Contract | Request | Response | 요청 특성 | 비고 |
|---|---|---|---|---|---|---|---|
| 인증 | 생성 | 단건 | `AuthLoginContract` | `AuthLoginRequestDto` | `AuthLoginResponseDto` | `PayloadRequestDto` | 인증 로그인 |
| 인증 | 생성 | 단건 | `AuthRefreshTokenContract` | `AuthRefreshTokenRequestDto` | `AuthRefreshTokenResponseDto` | `PayloadRequestDto` | 토큰 재발급 |
| 인증 | 조회 | 단건 | `AuthGetMeContract` | 없음 | `AuthGetMeResponseDto` | 없음 | 세션 스냅샷 |
| 인증 | 수정 | 단건 | `AuthChangePasswordContract` | `AuthChangePasswordRequestDto` | `AuthChangePasswordResponseDto` | `PayloadRequestDto` | 비밀번호 변경 |
| 인증 | 수정 | 단건 | `AuthDeferPasswordChangeContract` | `AuthDeferPasswordChangeRequestDto` | `AuthDeferPasswordChangeResponseDto` | `PayloadRequestDto` | 비밀번호 변경 유예 |

## 기능별 계약표

| 분류 | 기능 | 기능상세 | Contract | Request | Response | 요청 특성 | 비고 |
|---|---|---|---|---|---|---|---|
| 공지 | 생성 | 단건 | `CreateAnnouncementContract` | `CreateAnnouncementRequestDto` | `CreateAnnouncementResponseDto` | `EntityRequestDto<Announcement>` | 공지 생성 |
| 공지 | 조회 | 복수 | `GetAnnouncementsContract` | `GetAnnouncementsRequestDto` | `GetAnnouncementResponseDto[]` | `ListRequestDto<Announcement>` | 공지 목록 |
| 공지 | 수정 | 단건 | `UpdateAnnouncementContract` | `UpdateAnnouncementRequestDto` | `UpdateAnnouncementResponseDto` | `EntityRequestDto<Announcement>` | 공지 수정 |
| 공지 | 삭제 | 단건 | `DeleteAnnouncementContract` | `DeleteAnnouncementRequestDto` | `DeleteAnnouncementResponseDto` | `IdRequestDto<Announcement>` | 공지 삭제 |
| 권한 | 조회 | 복수 | `GetPermissionSetsContract` | 없음 | `GetPermissionSetResponseDto[]` | 없음 | 권한세트 목록 |
| i18n | 조회 | 복수 | `GetLocalesContract` | 없음 | `GetLocalesResponseDto` | 없음 | 활성 로케일 목록 |
| 리소스 | 조회 | 단건 | `GetResourceContract` | `GetResourceRequestDto` | `GetResourceResponseDto` | `IdRequestDto<Resource>` | 리소스 1건 조회 |
| 리소스 | 조회 | 복수 | `GetResourcesContract` | `GetResourcesRequestDto` | `GetResourceResponseDto[]` | `ListRequestDto<Resource>` | 리소스 트리/목록 |
| 멤버 | 생성 | 단건 | `CreateInviteContract` | `CreateInviteRequestDto` | `CreateInviteResponseDto` | `EntityRequestDto<MemberInvite>` | 멤버 초대 생성 |
| 멤버 | 조회 | 단건 | `GetMemberContract` | `GetMemberRequestDto` | `GetMemberResponseDto` | `IdRequestDto<Member>` | 멤버 1건 조회 |
| 멤버 | 수정 | 단건 | `UpdateMemberRoleContract` | `UpdateMemberRoleRequestDto` | `UpdateMemberRoleResponseDto` | `EntityRequestDto<Member>` | 멤버 역할 변경 |
| 멤버 | 수정 | 단건 | `UpdateMemberStatusContract` | `UpdateMemberStatusRequestDto` | `UpdateMemberStatusResponseDto` | `EntityRequestDto<Member>` | 멤버 상태 변경 |
| 멤버 | 조회 | 복수 | `GetMembersContract` | `GetMembersRequestDto` | `GetMembersResponseDto[]` | `PageRequestDto<Member>` | 멤버 목록, 조직 역할 코드 필터 포함 |
| 약관 | 생성 | 단건 | `CreateTermsAgreementContract` | `CreateTermsAgreementRequestDto` | `CreateTermsAgreementResponseDto` | `PayloadRequestDto` | 약관 동의 |
| 약관 | 조회 | 단건 | `GetTermsDocumentContract` | `GetTermsDocumentRequestDto` | `GetTermsDocumentDetailResponseDto` | `IdRequestDto<TermsDocument>` | 약관 문서 상세 조회 |
| 약관 | 조회 | 복수 | `GetActiveTermsContract` | 없음 | `GetTermsDocumentResponseDto[]` | 없음 | 활성 약관 목록 |
| 약관 | 조회 | 복수 | `GetTermsDocumentVersionsContract` | `GetTermsDocumentVersionsRequestDto` | `GetTermsDocumentVersionResponseDto[]` | `ListRequestDto<TermsVersion>` | 약관 버전 목록 |
| 약관 | 조회 | 복수 | `GetTermsDocumentsContract` | `GetTermsDocumentsRequestDto` | `GetTermsDocumentResponseDto[]` | `ListRequestDto<TermsDocument>` | 약관 문서 목록 |
| 조직 | 수정 | 단건 | `UpdateOrganizationApprovalContract` | `UpdateOrganizationApprovalRequestDto` | `UpdateOrganizationApprovalResponseDto` | `EntityRequestDto<Organization>` + `approve` | 조직 승인/거절 |
| 조직 | 조회 | 복수 | `GetOrganizationsContract` | `GetOrganizationsRequestDto` | `GetOrganizationsResponseDto` | `ListRequestDto<Organization>` | 조직 목록 |
| 티켓 | 조회 | 복수 | `GetTicketsContract` | `GetTicketsRequestDto` | `GetTicketResponseDto[]` | `PageRequestDto<SupportTicket>` | 티켓 목록 |

## 표준화 대상 판단 기준

### request

- `inline { id: string }` 는 금지한다.
- `query.id` 직접 주입은 금지한다.
- `Pick<...> & { id: string }` 형태는 request DTO로 통합한다.
- `PayloadRequestDto`는 바디가 비어 있거나, 공통 payload만 가지는 경우에만 사용한다.

### response

- 단건 생성/갱신/삭제 결과는 가능하면 `IdResponseDto` 또는 `PayloadResponseDto`를 사용한다.
- 엔티티 1건 응답은 `EntityResponseDto` 기반으로 맞춘다.
- 목록 응답은 `ListResponseDto` / `PageResponseDto` / `CursorResponseDto` 중 하나를 사용한다.
- `detail`, `tree`, `aggregate` 성격은 커스텀 response DTO를 허용한다.

## 예외 허용 범위

- `AuthGetMeResponseDto`
- `GetTermsDocumentDetailResponseDto`
- `GetResourceResponseDto`의 `children`
- `GetAnnouncementResponseDto`의 파생 필드
- `GetPermissionSetResponseDto`의 집계 필드

이 항목들은 단순 CRUD 표준 계약으로 대체하지 않는다.

## 작업 방식

1. 이 문서의 기능 분류를 먼저 확인한다.
2. request / response가 표준 계약인지 판단한다.
3. 표준에서 벗어나는 경우에만 DTO를 수정한다.
4. 수정 후에는 이 문서의 표를 갱신한다.
