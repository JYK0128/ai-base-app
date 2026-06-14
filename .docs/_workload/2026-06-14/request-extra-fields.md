# Getter 기반 DTO 정리 - 2026-06-15

## 목적

`apps/platform-service`에서 getter를 참조하는 request / response DTO 필드를 정리한다.
여기서 `참조변수`는 엔티티 관점에서 해당 필드를 만들 때 직접 읽는 값, 즉 `metadata.publishedAt` 같은 실제 접근 경로를 의미한다.

## Getter 기반 DTO 필드

| 도메인 | 기능 | 기능상세 | DTO | 필드명 | 참조변수 | 설명 |
|---|---|---|---|---|---|---|
| 공지 | 조회 | 복수 | `GetAnnouncementsRequestDto` | `isPublished` | `metadata.publishedAt` | 게시된 공지만 조회할지 여부이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `status` | `metadata.publishedAt`, `metadata.startAt`, `metadata.endAt` | 게시 상태이다. |
| 공지 | 조회 | 복수 | `GetAnnouncementResponseDto` | `isPublished` | `metadata.publishedAt` | 게시 여부이다. |
| 조직 | 조회 | 복수 | `GetOrganizationsRequestDto` | `status` | `metadata.approvedAt`, `metadata.deactivatedAt`, `metadata.rejectedAt` | 조직 상태 필터이다. |
| 조직 | 조회 | 복수 | `GetOrganizationResponseDto` | `status` | `metadata.approvedAt`, `metadata.deactivatedAt`, `metadata.rejectedAt` | 조직 상태이다. |
| 약관 | 조회 | 복수 | `GetTermsDocumentsRequestDto` | `status` | `metadata.publishedAt`, `metadata.terminatedAt` | 약관 상태 필터이다. |
| 약관 | 조회 | 복수 | `GetTermsDocumentResponseDto` | `status` | `metadata.publishedAt`, `metadata.terminatedAt` | 약관 상태이다. |
| 약관 | 조회 | 복수 | `GetTermsDocumentResponseDto` | `publishedAt` | `metadata.publishedAt` | 게시 확정 시각이다. |
| 약관 | 조회 | 복수 | `GetTermsDocumentResponseDto` | `terminatedAt` | `metadata.terminatedAt` | 종료 시각이다. |
| 약관 | 조회 | 복수 | `GetTermsDocumentsRequestDto` | `scope` | `organization` | 플랫폼 / 조직 구분을 조회 조건으로 사용하는 값이다. |

## 작업 기준

- metadata 파생 항목은 이 문서에 넣지 않는다.
- getter를 직접 참조하는 항목만 이 문서에 남긴다.
