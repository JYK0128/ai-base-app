# 약관관리 메뉴 기능명세서

## 1. 개요

약관관리 메뉴는 플랫폼 관리자 포털에서 약관 문서와 버전 이력을 생성, 조회, 수정, 폐기, 삭제하는 기능을 제공한다.

현재 화면은 `web/platform-admin-web/src/routes/_protected/terms/index.tsx`와 `web/platform-admin-web/src/routes/_protected/terms/-tabs/TermsManagementTab.tsx`에서 구현되어 있으며, 라우트 경로는 `/terms`이다.

## 2. 메뉴 식별 정보

| 항목 | 값 |
| --- | --- |
| 메뉴명 | 약관 관리 |
| 리소스 코드 | `TERMS` |
| 리소스 유형 | `MENU` |
| 리소스 범위 | `PLATFORM` |
| 경로 | `/terms` |
| 아이콘 | `FileText` |
| 기본 권한 | `CREATE`, `READ`, `UPDATE`, `DELETE` |

## 3. 메뉴 목적

| 목적 | 설명 |
| --- | --- |
| 약관 문서 관리 | 서비스 이용약관, 개인정보 처리방침, 마케팅 동의 등 약관 문서를 플랫폼 또는 조직 단위로 등록한다. |
| 버전 이력 관리 | 약관 본문과 발효 시점을 기준으로 버전 이력을 관리한다. |
| 상태 통제 | 문서 폐기, 폐기 예약, 물리 삭제, 버전 수정 가능 여부를 제어한다. |
| 동의 이력 기반 제공 | 사용자 동의 흐름에서 참조할 최신 활성 약관 데이터를 제공할 수 있도록 준비한다. |

## 4. 화면 구성

### 4.1 좌측 패널

| 요소 | 설명 |
| --- | --- |
| scope 탭 | `플랫폼`, `조직` 탭으로 문서 목록을 전환한다. |
| 카운트 배지 | 각 scope에 포함된 문서 수를 표시한다. |
| 추가 버튼 | 현재 scope 기준으로 새 약관 문서 생성 모달을 연다. |
| 문서 카드 | 제목, 코드, scope, 필수 여부, 상태를 한 번에 보여준다. |

### 4.2 우측 패널

| 요소 | 설명 |
| --- | --- |
| 문서 헤더 | 선택한 약관 문서 제목과 상태 메시지를 표시한다. |
| 액션 버튼 | 문서 폐기/삭제, 버전 추가, 폐기 예약 취소를 제공한다. |
| 버전 목록 | 선택한 문서의 버전 이력을 표 형태로 보여준다. |
| 검색 | 버전 라벨, 본문, 상태를 대상으로 검색한다. |

### 4.3 모달

| 모달 | 목적 |
| --- | --- |
| 약관 문서 생성 | 새 문서를 등록한다. |
| 약관 버전 초안 생성 | 선택한 문서에 연결되는 새 버전을 만든다. |
| 약관 문서 삭제/폐기 경고 | 현재 활성 버전 유무에 따라 물리 삭제 또는 즉시/예약 폐기를 처리한다. |
| 약관 버전 상세 | 선택한 버전의 메타데이터와 본문을 확인한다. |
| 약관 버전 수정 | 수정 가능한 버전의 라벨, 발효 일시, 본문을 수정한다. |

## 5. 데이터 모델

### 5.1 약관 문서

| 필드 | 설명 |
| --- | --- |
| `id` | 약관 문서 식별자 |
| `organizationId` | 조직 식별자, 플랫폼 문서는 `null` 또는 비어 있음 |
| `code` | 약관 문서 코드 |
| `title` | 약관 제목 |
| `required` | 필수 약관 여부 |
| `status` | 문서 기본 상태 (`DRAFT`, `PUBLISHED`) |
| `deprecatedAt` | 폐기 예정 또는 폐기 완료 시점. 문서 폐기 판정의 최우선 기준이다. |

### 5.2 약관 버전

| 필드 | 설명 |
| --- | --- |
| `id` | 약관 버전 식별자 |
| `versionLabel` | 버전 라벨 |
| `content` | 약관 본문 |
| `status` | 버전 상태 (`DRAFT`, `PUBLISHED`) |
| `effectiveAt` | 발효 시각, 편집 가능 버전 판단과 표시용으로 사용 |
| `effectiveTo` | 저장하지 않음. 다음 게시 버전의 `effectiveAt`으로 계산되는 종료 시각 |

### 5.3 화면 확장 상태

| 상태 | 설명 |
| --- | --- |
| 문서 `폐기 예약` | `deprecatedAt`이 미래 시점일 때 표시되는 화면상 확장 상태 |
| 버전 `현재 효력중` | 현재 시점 기준으로 가장 최근에 발효된 게시 버전 |
| 버전 `예약 발효` | 발효 시작일이 미래인 게시 버전 |
| 버전 `이전 버전` | 현재 효력중이 아니고 예약 발효도 아닌 게시 버전 |

## 6. 기능 상세

### 6.1 문서 scope 전환

- 화면은 `플랫폼`과 `조직` 두 개의 scope 탭을 제공한다.
- scope를 전환하면 해당 scope의 마지막 선택 문서를 우선 복원한다.
- 문서가 하나도 없으면 빈 상태 메시지를 보여준다.
- 조직 컨텍스트가 없는 경우 조직 약관 생성은 허용하지 않는다.

### 6.2 문서 생성

- 사용자는 문서 코드, 제목, scope, 필수 여부를 입력한다.
- 코드 입력값은 저장 전에 대문자와 언더스코어 형식으로 정규화한다.
- 동일한 코드가 이미 존재하면 생성할 수 없다.
- 조직 scope 문서는 `organizationId`가 있는 경우에만 생성한다.
- 생성 완료 후 새 문서를 선택하고 문서 목록에 즉시 반영한다.
- 생성 상태는 기본값으로 `DRAFT`를 사용한다.

### 6.3 문서 폐기

- 선택한 문서에 대해 즉시 폐기, 예약 폐기, 물리 삭제를 선택할 수 있다.
- 현재 효력 중인 약관 버전이 없으면 문서는 폐기 대신 물리 삭제된다.
- 물리 삭제 시 문서와 연결된 버전 이력도 함께 제거된다.
- 즉시 폐기는 `deprecatedAt`을 현재 시각으로 저장하고 읽기 전용으로 만든다.
- 예약 폐기는 `deprecatedAt`에 미래 시점을 저장하고, 해당 시점까지는 화면상 `폐기 예약`으로 표시한다.
- 예약 폐기를 등록한 후에는 예약 취소 버튼으로 예정 상태를 해제할 수 있다.
- 문서가 실제로 폐기되면 버전 수정 기능이 차단된다.

### 6.4 버전 목록 조회

- 선택한 문서에 연결된 버전만 표로 표시한다.
- 표는 버전 라벨, 발효 일시, 개정 요약 및 변경 사유, 개정 이력 일정, 상태로 구성한다.
- 버전 라벨을 클릭하면 상세 모달이 열린다.
- 검색은 버전 라벨, 본문, 상태를 대상으로 수행한다.

### 6.5 버전 생성

- 선택한 문서에 새 버전을 추가한다.
- 입력 항목은 버전 라벨, 효력 시각, 버전 상태, 약관 본문이다.
- 효력 시각은 `datetime-local` 형식으로 입력하며 분 단위 정밀도를 사용한다.
- 효력 종료 시각은 별도로 입력하지 않으며, 같은 문서의 다음 `PUBLISHED` 버전 `effectiveAt`으로 계산한다.
- 모든 필드는 필수이다.
- 생성된 버전은 목록 상단에 추가된다.

### 6.6 버전 상세

- 상세 모달에서는 문서 코드, 문서명, scope, 버전 라벨, checksum, 발효 시각, 계산된 종료 시각, 버전 ID, 상태, 수정 가능 여부, 본문을 확인한다.
- 버전 상세의 `수정` 버튼은 수정 가능한 버전일 때만 노출된다.
- 수정 가능 버전은 문서가 폐기 상태가 아니고, 버전이 `DRAFT`이거나 `PUBLISHED`이면서 발효 시점이 현재보다 미래인 경우이다.
- 이미 발효된 버전은 읽기 전용으로 처리한다.

### 6.7 버전 수정

- 수정 가능한 버전에 한해 라벨, 효력 시각, 상태, 본문을 수정한다.
- 수정 화면은 상세 화면에서 진입한다.
- 폐기된 문서는 버전 수정 화면을 열 수 없다.
- 수정 결과는 현재 선택 문서의 버전 목록에 즉시 반영된다.

## 7. 상태 판정 규칙

### 7.1 문서 상태

| 판정 기준 | 표시 상태 |
| --- | --- |
| `deprecatedAt`이 미래 시점 | `폐기 예약` |
| `deprecatedAt`이 현재 또는 과거 시점 | `DEPRECATED` |
| `deprecatedAt`이 없고 `status = DRAFT` | `DRAFT` |
| `deprecatedAt`이 없고 `status = PUBLISHED` | `PUBLISHED` |

- 현재 효력 중인 버전이 없는 문서는 삭제 대상으로 처리한다.

### 7.2 버전 상태

| 판정 기준 | 표시 상태 |
| --- | --- |
| `status = DRAFT` | `임시저장` |
| `status = PUBLISHED` + 발효 시각이 미래 | `예약 발효` |
| `status = PUBLISHED` + 현재 효력중인 최신 버전 | `현재 효력중` |
| `status = PUBLISHED` + 현재 효력이 끝난 버전 | `이전 버전` |

- 버전의 종료 시각은 저장하지 않고, 다음 버전의 `effectiveAt`으로 계산한다.
- 과거 상태는 저장하지 않고, `status = PUBLISHED`와 발효 시각 조합으로 계산한다.

## 8. 입력 검증

| 항목 | 검증 규칙 |
| --- | --- |
| 문서 코드 | 공백 제거 후 비어 있으면 안 되며, 중복 코드가 있으면 저장 실패 |
| 문서 제목 | 공백 제거 후 비어 있으면 안 됨 |
| 문서 scope | `platform` 또는 `organization`만 허용 |
| 버전 라벨 | 공백 제거 후 비어 있으면 안 됨 |
| 효력 시각 | 비어 있으면 안 됨 |
| 버전 상태 | 허용된 상태 값만 허용 |
| 약관 본문 | 공백 제거 후 비어 있으면 안 됨 |
| 예약 폐기 일시 | 예약 폐기 선택 시 반드시 필요 |

## 9. 사용자 피드백

| 상황 | 피드백 |
| --- | --- |
| 저장 중 | 로더와 `저장 중...` 문구를 표시한다. |
| 저장 성공 | 토스트로 성공 메시지를 표시한다. |
| 저장 실패 | 토스트로 오류 메시지를 표시한다. |
| 선택 문서 없음 | 버전 영역에 안내 문구를 표시한다. |
| 문서 없음 | 문서 목록에 빈 상태 메시지를 표시한다. |
| 버전 상세 없음 | 상세 모달에 안내 문구를 표시한다. |

## 10. API 연동 기준

현재 화면은 목업 상태 기반으로 동작하지만, 실제 연동 시 아래 API를 사용한다.
이 메뉴의 변경성 API는 `GET`과 `POST`만 사용하며, 상태 변경과 삭제도 모두 `POST` command로 처리한다.

| 기능 | Method | Endpoint | 상태 | 비고 |
| --- | --- | --- | --- | --- |
| 활성 약관 조회 | `GET` | `/api/v1/terms` | 현재 구현 | 사용자 동의 화면용, `organizationId` query 지원 |
| 약관 문서 목록 조회 | `GET` | `/api/v1/terms/documents` | 예상 필요 | 관리자 목록용, `organizationId`, `scope`, `status`, `keyword` query 지원 |
| 약관 문서 상세 조회 | `GET` | `/api/v1/terms/documents/{id}` | 예상 필요 | 문서 기본 정보, `deprecatedAt`, 대표 버전, 버전 요약 포함 |
| 약관 버전 목록 조회 | `GET` | `/api/v1/terms/documents/{id}/versions` | 예상 필요 | 문서별 버전 이력 조회 |
| 문서 생성 | `POST` | `/api/v1/terms/documents` | 현재 구현 | `CreateTermsDocumentDto` 사용 |
| 문서 폐기/예약 | `POST` | `/api/v1/terms/documents/deprecate` | 예상 필요 | body에 `id`, `deprecatedAt` 포함, 현재/미래 시각 모두 허용 |
| 폐기 예약 취소 | `POST` | `/api/v1/terms/documents/cancel-deprecation` | 예상 필요 | body에 `id` 포함, 예약 폐기 취소 후 `deprecatedAt` 제거 |
| 문서 물리 삭제 | `POST` | `/api/v1/terms/documents/delete` | 예상 필요 | body에 `id` 포함, 현재 효력 중인 버전이 없을 때만 허용 |
| 버전 생성 | `POST` | `/api/v1/terms/versions` | 현재 구현 | `CreateTermsVersionDto` 사용 |
| 버전 수정 | `POST` | `/api/v1/terms/versions/update` | 예상 필요 | body에 `id` 포함, 수정 가능한 버전만 허용 |
| 약관 동의 저장 | `POST` | `/api/v1/terms/agreements` | 현재 구현 | 사용자 동의 이력 저장용 |

### 10.1 주요 DTO

아래 DTO는 현재 구현된 것과 연동 시 추가가 필요한 것을 함께 포함한다.

| DTO | 핵심 필드 |
| --- | --- |
| `TermsDocumentResponseDto` | `id`, `organizationId`, `code`, `title`, `required`, `status`, `deprecatedAt` |
| `TermsDocumentDetailResponseDto` | `document`, `versions`, `currentVersion` |
| `TermsVersionResponseDto` | `id`, `versionLabel`, `content`, `status`, `effectiveAt` |
| `CreateTermsDocumentDto` | `code`, `title`, `required`, `organizationId` |
| `CreateTermsVersionDto` | `termsDocumentId`, `label`, `content`, `effectiveAt`, `status` |
| `DeprecateTermsDocumentDto` | `id`, `deprecatedAt` |
| `CancelDeprecationTermsDocumentDto` | `id` |
| `DeleteTermsDocumentDto` | `id` |
| `UpdateTermsVersionDto` | `id`, `label`, `content`, `effectiveAt`, `status` |
| `AgreeTermsDto` | `memberId`, `termsVersionId`, `organizationId`, `source`, `ipAddress`, `userAgent` |

### 10.2 구현 메모

- 현재 생성된 API DTO에는 `deprecatedAt`과 `effectiveAt`이 충분히 포함되어 있지 않다.
- 현재 백엔드 계약은 문서 응답에 `deprecatedAt`, 버전 응답에 `effectiveAt`을 포함하며, 버전 상태는 `DRAFT`와 `PUBLISHED`만 저장한다.
- 화면은 현재 이 계약을 기준으로 동작하며, 과거 버전 여부와 종료 시각은 다음 버전의 `effectiveAt`으로 계산한다.
- 물리 삭제는 현재 mock 상태에서 문서 및 연결 버전 삭제로 시뮬레이션하며, 실 연동 시 `POST /api/v1/terms/documents/delete` 같은 command API와 cascade 삭제 정책이 필요하다.

## 11. 현행 구현 주의사항

- 화면은 현재 mock 데이터와 로컬 상태로 동작하므로 새로고침 시 초기 상태로 복원된다.
- 현재 효력 중인 약관이 없는 문서를 삭제하면 문서와 버전이 목록에서 완전히 제거된다.
- 버전 생성 및 수정 화면에는 `폐기` 상태 옵션이 있으나, 문서 폐기와는 별개인 버전 게시 상태 표현용이다.
- 버전 화면은 `effectiveTo`를 입력받지 않으며, 실제 서비스 연동 시 종료 시각은 계산값으로만 표시한다.
- 문서 상세는 별도 편집 폼이 없고, 문서 수준에서는 생성, 폐기, 삭제만 제공한다.
