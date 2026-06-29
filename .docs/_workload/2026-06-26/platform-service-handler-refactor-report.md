# Platform Service Handler Refactor Report

## 목적

- `identify - verify - process` 단계의 의미를 CQRS의 `command` / `query` 두 축으로 정리한 과정을 기록한다
- 조회형 핸들러의 `process` 역할을 "메인 데이터 조회 + DTO wrapping"으로 확정한 결과를 남긴다
- command/query 인자를 쪼개지 않고 `process(command/query, identified...)` 순서를 유지하도록 정리한 내용을 기록한다
- handler 구조 감사, 단계 의미, 작업 결과를 한 문서에서 확인할 수 있게 한다

## 작업 순서

1. 기존 핸들러를 전수 조사해 `identify`, `verify`, `process` 메서드 보유 여부를 점검했다
2. `verify*`, `validate*` 메서드명을 `verify*`로 통일했다
3. `process` 인자 순서를 `command/query` 우선으로 맞췄다
4. 조회형 핸들러는 `identify/verify`를 사전 조건 확인으로 제한하고, `process`에서 메인 조회와 DTO 조립을 수행하도록 재배치했다
5. 조회형 핸들러의 의미를 다시 정의해, `process`가 단순 DTO wrapping이 아니라 메인 데이터 조회까지 책임지도록 문서화했다
6. 감사 문서와 의미 문서를 코드 상태에 맞게 동기화했다

## 적용한 규칙

### 단계 의미

| 단계 | 의미 |
| --- | --- |
| identify | 요청 컨텍스트, 선행 대상, 조회 전 필요한 상태를 확보한다 |
| verify | 정책, 정합성, 권한, 제약 조건을 확인한다 |
| process | 메인 데이터를 조회하고, 최종 DTO를 조립하거나 상태 변경/외부 효과를 수행한다 |

### CQRS 규칙

| 분류 | 의미 |
| --- | --- |
| command | 대상 조회 후 정책 확인과 상태 변경 또는 외부 효과를 수행한다 |
| query | 사전 조건을 확인한 뒤 `process`에서 메인 데이터를 조회하고 DTO를 조립한다 |

### 조회형 핸들러 규칙

- `identify`와 `verify`는 메인 조회 전의 사전 조건만 다룬다
- `process`는 메인 데이터 조회를 수행한다
- `process`는 조회 결과를 응답 DTO로 감싼다
- `process(command/query, identified...)` 순서를 유지한다

## 통합 결과

| Handler | CQRS | identify | verify | process | 핵심 역할 |
| --- | --- | --- | --- | --- | --- |
| [create-announcement.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/announcement/create-announcement/create-announcement.handler.ts) | command | `identifyMetadata` | `verifyCreation` | `processCreation` | 공지 생성 |
| [delete-announcement.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/announcement/delete-announcement/delete-announcement.handler.ts) | command | `identifyAnnouncement` | `verifyDeletion` | `processDelete` | 공지 삭제 |
| [get-announcement-page.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/announcement/get-announcement-page/get-announcement-page.handler.ts) | query | `-` | `verifyAnnouncementPage` | `processPage` | 페이지 조회 + DTO 조립 |
| [get-announcement.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/announcement/get-announcement/get-announcement.handler.ts) | query | `-` | `verifyAnnouncement` | `processDetail` | 단건 조회 + DTO 조립 |
| [update-announcement.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/announcement/update-announcement/update-announcement.handler.ts) | command | `identifyRequestAccount` | `verifyUpdate` | `processUpdate` | 공지 수정 |
| [agree-terms.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/agree-terms/agree-terms.handler.ts) | command | `identifyMember` | `verifyTermsAgreement` | `processAgreement` | 약관 동의 기록 |
| [allowed-resource-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/allowed-resource-list/allowed-resource-list.handler.ts) | query | `identifyPermissions` | `verifyAllowedResources` | `processTree` | 허용 리소스 트리 조립 |
| [change-password.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/change-password/change-password.handler.ts) | command | `identifyAccount` | `verifyPolicies` | `processChangePassword` | 비밀번호 변경 |
| [defer-password-change.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/defer-password-change/defer-password-change.handler.ts) | command | `identifyAccount` | `verifyDeferment` | `processUpdate` | 변경 유예 처리 |
| [login.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/login/login.handler.ts) | command | `identifyClientIp`, `identifyAccount` | `verifyLogin` | `processLogin` | 로그인 성공 처리 |
| [me.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/me/me.handler.ts) | query | `identifyAccount`, `identifyMember`, `identifyOrganization`, `identifyPermissions` | `verifyMeContext` | `processProfile` | 내 정보 응답 조립 |
| [pending-term-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/auth/pending-term-list/pending-term-list.handler.ts) | query | `identifyOrganization`, `identifyMember` | `verifyPendingTerms` | `processList` | 약관 목록 조회 + 필터링 |
| [get-locale-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/i18n/locale-list/get-locale-list.handler.ts) | query | `-` | `verifyLocales` | `processList` | 로케일 목록 조회 + DTO 조립 |
| [send-invite-email.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/mail/send-invite-email/send-invite-email.handler.ts) | command | `identifyPayload` | `verifyPolicies` | `processSend` | 이메일 전송 |
| [create-invite.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/member/create-invite/create-invite.handler.ts) | command | `identifyOrganization`, `identifyInviter`, `identifyRole` | `verifyPolicies` | `processCreation` | 초대 생성 |
| [get-member-page.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/member/get-member-page/get-member-page.handler.ts) | query | `identifyOrganization` | `verifyMemberPage` | `processPage` | 멤버 페이지 조회 + DTO 조립 |
| [get-member.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/member/get-member/get-member.handler.ts) | query | `identifyOrganization` | `verifyMember` | `processDetail` | 멤버 단건 조회 + DTO 조립 |
| [update-member-role.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/member/update-member-role/update-member-role.handler.ts) | command | `identifyOrganization`, `identifyRequestMember`, `identifyMember`, `identifyRole` | `verifySelfMutation` | `processRoleUpdate` | 멤버 역할 변경 |
| [update-member-status.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/member/update-member-status/update-member-status.handler.ts) | command | `identifyOrganization`, `identifyRequestMember`, `identifyMember` | `verifySelfMutation` | `processStatusUpdate` | 멤버 상태 변경 |
| [approve-organization.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/organization/approve-organization/approve-organization.handler.ts) | command | `identifyOrganization` | `verifyPolicies` | `processApprove` | 조직 승인 처리 |
| [get-organization-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/organization/get-organization-list/get-organization-list.handler.ts) | query | `-` | `verifyOrganizations` | `processList` | 조직 목록 조회 + DTO 조립 |
| [get-organization-role-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/organization/organization-role-list/get-organization-role-list.handler.ts) | query | `identifyOrganization` | `verifyRoles` | `processList` | 역할 목록 조회 + DTO 조립 |
| [update-organization.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/organization/update-organization/update-organization.handler.ts) | command | `identifyRequestAccount`, `identifyOrganization` | `verifyEmailAvailability` | `processUpdate` | 조직 수정 |
| [get-resource-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/resource/get-resource-list/get-resource-list.handler.ts) | query | `identifyOrganization` | `verifyResources` | `processList` | 리소스 트리 조회 + DTO 조립 |
| [get-resource.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/resource/get-resource/get-resource.handler.ts) | query | `-` | `verifyResource` | `processDetail` | 리소스 단건 조회 + DTO 조립 |
| [get-role-permission-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/resource/get-role-permission-list/get-role-permission-list.handler.ts) | query | `identifyOrganization` | `verifyRoles` | `processList` | 권한 목록 조회 + DTO 조립 |
| [get-ticket-page.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/support/get-ticket-page/get-ticket-page.handler.ts) | query | `-` | `verifyTicketPage` | `processPage` | 티켓 페이지 조회 + DTO 조립 |
| [get-term-document-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/term/get-term-document-list/get-term-document-list.handler.ts) | query | `identifyOrganization` | `verifyTermDocumentList` | `processList` | 약관 문서 목록 조회 + 필터링 |
| [get-term-document-version-list.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/term/get-term-document-version-list/get-term-document-version-list.handler.ts) | query | `-` | `verifyVersionList` | `processList` | 버전 목록 조회 + DTO 조립 |
| [get-term-document.handler.ts](/Users/server/Documents/GitHub/ai-base-app/apps/platform-service/src/domains/term/get-term-document/get-term-document.handler.ts) | query | `-` | `verifyDocument` | `processDetail` | 약관 상세 조회 + DTO 조립 |

## 검증 결과

- `pnpm exec tsc -p apps/platform-service/tsconfig.json --noEmit` 통과
- `pnpm exec eslint src/domains` 통과
- `apps/platform-service/src/domains` 기준 구조상 미준수 핸들러 없음

## 결론

- CQRS 분류 기준은 `command` / `query` 두 가지다
- `identify`와 `verify`는 사전 조건, `process`는 command에서는 변이/전송, query에서는 메인 조회와 DTO 조립이다
- 이 문서 하나로 구조 감사, 단계 의미, 작업 결과를 함께 관리한다
