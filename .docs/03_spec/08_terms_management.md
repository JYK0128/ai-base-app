# 약관 관리 메뉴 기능명세서 (FE)

## 1. 개요

* 플랫폼 관리자 포털에서 약관 문서와 버전 이력의 생성/조회/수정/폐기/삭제 기능 제공.
* 구현 파일: `web/platform-admin-web/src/routes/_protected/terms/index.tsx`와 `web/platform-admin-web/src/routes/_protected/terms/-tabs/TermsManagementTab.tsx` (라우트 경로: `/terms`).

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
| 약관 문서 관리 | 서비스 이용약관, 개인정보 처리방침 등의 약관 문서를 플랫폼 또는 조직 단위로 등록함. |
| 버전 이력 관리 | 약관 본문과 발효 시점을 기준으로 버전 이력을 관리함. |
| 상태 통제 | 문서 폐기, 폐기 예약, 물리 삭제, 버전 수정 가능 여부를 제어함. |
| 동의 이력 기반 제공 | 사용자 동의 흐름에서 참조할 최신 활성 약관 데이터를 연계 제공함. |

## 4. 화면 구성

### 4.1 좌측 패널 (문서 목록)
* **scope 탭**: `플랫폼`, `조직` 탭으로 문서 분류 필터링 수행.
* **카운트 배지**: 각 scope에 등록된 문서의 총 개수 표시.
* **추가 단추**: 현재 scope 기준으로 신규 약관 문서 생성 모달 트리거.
* **문서 카드**: 제목, 코드, 필수 여부, 상태 정보 카드 배치.

### 4.2 우측 패널 (버전 정보 및 상세)
* **문서 헤더**: 선택한 약관 문서의 제목 및 현재 폐기/예약 상태 노출.
* **액션 버튼**: 문서 폐기/삭제, 버전 추가, 폐기 예약 취소 단추 배치.
* **버전 목록**: 버전 라벨, 발효 일시, 개정 요약 및 상태 정보를 표 형태로 노출.
* **검색**: 버전 라벨, 본문, 상태 대상 실시간 검색 수행.

### 4.3 모달
* **약관 문서 생성**: 새 문서를 등록하는 입력 폼 제공.
* **약관 버전 초안 생성**: 새 버전 정보 및 본문을 기입하는 에디터 제공.
* **약관 문서 삭제/폐기 경고**: 상태(활성 버전 유무)에 따라 물리 삭제 또는 즉시/예약 폐기 처리 수행.
* **약관 버전 상세**: 버전의 체크섬, 발효 시각 및 본문 전체 정보 확인.
* **약관 버전 수정**: 편집 가능 버전의 라벨, 발효 일시, 본문 변경 지원.

## 5. 데이터 모델

### 5.1 약관 문서 (TermsDocument)

| 필드 | 설명 |
| --- | --- |
| `id` | 약관 문서 식별자 (UUID) |
| `organizationId` | 조직 식별자 (플랫폼 문서는 `null`) |
| `code` | 약관 문서 코드 |
| `title` | 약관 제목 |
| `required` | 필수 동의 약관 여부 (`true` / `false`) |
| `status` | 문서 기본 상태 (`DRAFT`, `PUBLISHED`) |
| `deprecatedAt` | 폐기 예정 또는 폐기 완료 시점 |

### 5.2 약관 버전 (TermsVersion)

| 필드 | 설명 |
| --- | --- |
| `id` | 약관 버전 식별자 (UUID) |
| `versionLabel` | 버전 식별 라벨 |
| `content` | 약관 본문 마크다운/텍스트 |
| `status` | 버전 상태 (`DRAFT`, `PUBLISHED`) |
| `effectiveAt` | 발효 적용 시작 시각 |
| `effectiveTo` | 다음 활성 버전의 발효 전까지 적용되는 계산상의 종료 시각 |

## 6. 기능 상세

### 6.1 문서 scope 전환
* `플랫폼`과 `조직` 두 개의 scope 탭을 유연하게 스위칭함.
* 탭 전환 시 이전에 선택했던 문서 활성 컨텍스트를 복원함.
* 조직 컨텍스트 정보가 없을 때 조직 범위의 약관 생성은 제한 처리함.

### 6.2 문서 생성 및 코드 정규화
* 사용자는 문서 코드, 제목, scope, 필수 여부를 입력하여 생성함.
* 코드 입력값은 전송 전에 대문자와 언더스코어 형식(`^[A-Z_]+$`)으로 정규화함.
* 동일 코드가 이미 존재하는 경우 등록 제한함.

### 6.3 문서 폐기 및 물리 삭제
* 활성 버전 이력이 존재하지 않는 경우 폐기 대신 물리 삭제(`Delete`)로 자동 판정하여 제거함.
* **즉시 폐기**: `deprecatedAt` 값을 현재 시각으로 설정하여 읽기 전용 상태로 고정함.
* **예약 폐기**: `deprecatedAt` 값을 미래 특정 시점으로 설정하여 예약 처리하며, 예약 취소 단추를 통해 예정 상태 해제 지원.

### 6.4 버전 생성 및 발효 시각 제어
* 발효 시각(`effectiveAt`)은 분 단위 정밀도를 지닌 `datetime-local` 형식으로 입력 제어함.
* 종료 시각은 별도로 입력받지 않으며, 동일 문서 내 다음 번에 게시되는 버전의 `effectiveAt` 정보를 참조하여 동적 계산 처리함.

### 6.5 버전 수정 제약
* 문서가 폐기 상태가 아니고, 버전이 `DRAFT`이거나 `PUBLISHED`이면서 발효 시점이 현재보다 미래인 경우에만 수정을 허용함.
* 이미 발효가 완료된 버전은 수정이 제한되며 읽기 전용으로 보호함.

## 7. 상태 판정 규칙

### 7.1 문서 상태 판정
| 판정 기준 | UI 표시 상태 |
| --- | --- |
| `deprecatedAt`이 미래 시점 | `폐기 예약` |
| `deprecatedAt`이 현재 또는 과거 시점 | `DEPRECATED` |
| `deprecatedAt`이 없고 `status = DRAFT` | `DRAFT` |
| `deprecatedAt`이 없고 `status = PUBLISHED` | `PUBLISHED` |

### 7.2 버전 상태 판정
| 판정 기준 | UI 표시 상태 |
| --- | --- |
| `status = DRAFT` | `임시저장` (회색 배지) |
| `status = PUBLISHED` + 발효 시각이 미래 | `예약 발효` (하늘색 배지) |
| `status = PUBLISHED` + 현재 효력중인 최신 버전 | `현재 효력중` (초록색 배지) |
| `status = PUBLISHED` + 현재 효력이 완료된 버전 | `이전 버전` (회색 배지) |

## 8. 입력 검증

| 항목 | 검증 규칙 |
| --- | --- |
| 문서 코드 | 필수 입력, 공백 제거 후 대문자 형식 검증, 중복 체크 수행 |
| 문서 제목 | 필수 입력, 공백 제외 문자열 검증 |
| 문서 scope | 필수 선택, `platform` 또는 `organization` 지정 |
| 버전 라벨 | 필수 입력, 공백 제외 문자열 검증 |
| 효력 시각 | 필수 입력, 미래 시점 설정 권장 |
| 약관 본문 | 필수 입력, 공백 제외 본문 검증 |

## 9. 사용자 피드백

| 상황 | 피드백 |
| --- | --- |
| 저장 진행 중 | 로딩 서클과 `저장 중...` 문구 버튼 내부 표출 |
| 저장 성공 | 토스트 알림: `성공적으로 저장되었습니다.` |
| 선택 문서 부재 | 우측 패널 중앙에 `선택된 약관 문서가 없습니다.` 가이드 표시 |

## 10. API 연동 기준

| 기능 | Method | Endpoint | DTO | 비고 |
| --- | --- | --- | --- | --- |
| 활성 약관 조회 | `GET` | `/api/v1/terms` | 없음 | 사용자 가입 동의 흐름용 |
| 약관 문서 목록 조회 | `GET` | `/api/v1/terms/documents` | `GetTermsQueryDto` | 필터링 및 키워드 검색 지원 |
| 약관 문서 상세 조회 | `GET` | `/api/v1/terms/documents/{id}` | `IdParamDto` | 대표 버전 포함 상세 조회 |
| 약관 버전 목록 조회 | `GET` | `/api/v1/terms/documents/{id}/versions` | `IdParamDto` | 해당 문서의 전체 버전 목록 조회 |
| 문서 생성 | `POST` | `/api/v1/terms/documents` | `CreateTermsDocumentDto` | 초기 DRAFT 문서 삽입 수행 |
| 문서 폐기/예약 | `POST` | `/api/v1/terms/documents/deprecate` | `DeprecateTermsDocumentDto` | 폐기 시각 설정 수행 |
| 폐기 예약 취소 | `POST` | `/api/v1/terms/documents/cancel-deprecation` | `CancelDeprecationTermsDocumentDto` | `deprecatedAt` 소멸 처리 |
| 문서 물리 삭제 | `POST` | `/api/v1/terms/documents/delete` | `DeleteTermsDocumentDto` | 효력 버전 부재 시에만 동작 |
| 버전 생성 | `POST` | `/api/v1/terms/versions` | `CreateTermsVersionDto` | 신규 버전 입력 수행 |
| 버전 수정 | `POST` | `/api/v1/terms/versions/update` | `UpdateTermsVersionDto` | 예약 버전 및 DRAFT 한정 수정 수행 |

---
*최종 업데이트: 2026-06-07*
