# 자원 및 메뉴 관리 메뉴 기능명세서 (FE)

## 1. 개요

* 플랫폼 내 각 화면(Menu), 하위 상세 자원(Button/Action), API Endpoint에 연계되는 전체 리소스 트리 구조의 조회/수정 기능 제공.
* 이에 매핑된 역할별 권한 매트릭스 구성 기능 제공.
* 구현 파일: `web/platform-admin-web/src/routes/_protected/resources/index.tsx` (라우트 경로: `/resources`).

## 2. 메뉴 식별 정보

| 항목 | 값 |
| --- | --- |
| 메뉴명 | 자원 및 메뉴 관리 |
| 리소스 코드 | `RESOURCE` |
| 리소스 유형 | `MENU` |
| 리소스 범위 | `PLATFORM` |
| 경로 | `/resources` |
| 아이콘 | `Layers` |
| 기본 권한 | `CREATE`, `READ`, `UPDATE`, `DELETE` |

## 3. 메뉴 목적

| 목적 | 설명 |
| --- | --- |
| 리소스 트리 구조화 | 메뉴 계정, 서브 페이지, 개별 액션을 트리 형태의 논리 구조로 일체화하여 관리함. |
| 노출 정렬 순서 제어 | 드래그 앤 드롭 방식을 이용하여 실제 사용자 사이드바 메뉴 렌더링 순서를 유연하게 변경함. |
| 다국어 레이블 지원 | 다국어(ko, en 등) 번역 사전을 매핑하여 다국어 사이드바 텍스트를 연계 처리함. |
| 권한 세트 및 매트릭스 | 역할 그룹 단위로 리소스 액션의 인가 여부를 체크박스 테이블 형태로 설계하고 일괄 통제함. |

## 4. 화면 구성

### 4.1 좌측 자원 트리 패널 (`ResourcePanel.tsx`)
* **관리 범위 전환**: `플랫폼`과 `조직` 탭을 스위칭하여 자원 범위를 전환함.
* **리소스 트리 구조 뷰어**: 부모-자식 노드 관계로 이루어진 계층 구조 트리 노출.
* **드래그 핸들러**: 노드를 직접 드래그하여 상하 또는 깊이 레벨 정렬 수정 수행.
* **노드 액션 단추**: 마우스 호버 시 추가(`+`), 수정(연필), 다국어 사전 설정, 삭제(`x`) 단추 노출.

### 4.2 우측 권한 매트릭스 패널 (`PermissionManagementTab.tsx`)
* **역할 셀렉터**: 권한을 부여받을 역할 목록(SYSTEM_ADMIN, PARTNER_OWNER 등) 선택창 제공.
* **액션 행렬**: 좌측에서 선택된 리소스에 사용 가능한 액션 목록(CREATE, READ, UPDATE, DELETE 등)이 체크박스 행렬로 배치됨.
* **저장 단추**: 변경된 권한 매핑을 백엔드에 일괄 제출함.

## 5. 데이터 모델

### 5.1 리소스 (Resource)

| 필드 | 설명 |
| --- | --- |
| `id` | 리소스 식별자 (UUID) |
| `code` | 리소스 고유 식별 코드 (예: `DASHBOARD`, `MEMBER`) |
| `name` | 리소스 이름 |
| `type` | 리소스 타입 (`MENU` / `ACTION` / `DATA`) |
| `scope` | 리소스 범위 (`PLATFORM` / `ORGANIZATION`) |
| `path` | 프론트엔드 라우트 경로 또는 API 경로 |
| `icon` | 아이콘 클래스 레이블 (Lucide 아이콘 키값) |
| `sortOrder` | 노드의 렌더링 가중치 정렬 순서 |
| `actions` | 정의된 액션 모음 (`['CREATE', 'READ', 'UPDATE', 'DELETE']`) |
| `constraint` | 추가 제약 조건 문자열 |
| `parentId` | 부모 노드 리소스 식별자 (루트 노드는 `null`) |

### 5.2 권한 세트 (PermissionSet)

| 필드 | 설명 |
| --- | --- |
| `id` | 권한 세트 식별자 (UUID) |
| `code` | 권한 세트 고유 코드 (예: `SYSTEM_OPERATOR`) |
| `name` | 권한 세트 명칭 |
| `description` | 권한 세트 상세 설명 |
| `permissionCodes` | 연계된 리소스 권한 코드 모음 |

## 6. 기능 상세

### 6.1 리소스 드래그 앤 드롭 정렬 (Drag & Drop)
* 사용자가 자원 트리 상의 노드를 직접 위/아래로 드래그 앤 드롭하여 배치 가능.
* 정렬 변경 이벤트 발생 시, 클라이언트는 변경된 모든 인접 노드들의 새로운 `sortOrder` 값을 계산하여 순서 정정 API (`POST /api/v1/resources/update-sort`)로 일괄 호출 수행.

### 6.2 신규 자원 등록 및 유효성 검사
* **메뉴 등록 모달**: 코드, 이름, 아이콘, 경로를 기입하여 새 루트/서브 메뉴 구성 수행.
* **서브 자원 등록 모달**: 메뉴 하위에 버튼이나 특정 액션을 수행하는 리소스를 `ACTION` 타입으로 추가함.
* 자원 코드는 저장 시 자동으로 대문자로 정규화되며 부모 자원 범위 내에서 중복 생성이 제한됨.

### 6.3 권한 세트 매핑 제어
* 관리자가 특정 역할에 맵핑된 리소스의 CRUD 액션 체크박스를 조작할 수 있음.
* 변경 사항을 저장하면 `UpdateResourcePermissionsDto` 규격으로 즉시 백엔드에 반영 처리함.

## 7. 상태 판정 규칙

### 7.1 리소스 유형 판정
| 리소스 유형 | UI 표시 상태 | 렌더링 목적 |
| --- | --- | --- |
| `MENU` | 폴더/파일 아이콘 트리 | 사이드바 메뉴 바인딩용 렌더링 |
| `ACTION` | 키패드/단추 모양 배지 | 화면 내 버튼 및 접근 제어 적용 |
| `DATA` | 데이터베이스 아이콘 배지 | 데이터 컬럼 및 행 단위 접근 권한 적용 |

## 8. 입력 검증

| 항목 | 검증 규칙 |
| --- | --- |
| 리소스 코드 | 필수 입력, 공백 제거 후 영대문자/언더바 (`^[A-Z_]+$`) 형식 검사 |
| 리소스 이름 | 필수 입력, 공백 제외 문자열 검증 |
| 리소스 유형 | 필수 선택, `MENU`, `ACTION`, `DATA` 중 하나로 한정 |
| 정렬 순서 | 필수 입력, 정수 값 검사 |
| 권한 세트 코드 | 필수 입력, 영대문자/언더바 형식 검사 |

## 9. 사용자 피드백

| 상황 | 피드백 |
| --- | --- |
| 트리 재배치 성공 | 토스트 메시지 출력: `리소스 정렬 순서가 업데이트되었습니다.` |
| 중복 리소스 코드 | 경고 문구 노출: `이미 존재하는 리소스 코드입니다.` |
| 권한 저장 완료 | 토스트 메시지 출력: `역할 권한 매핑이 저장되었습니다.` |

## 10. API 연동 기준

| 기능 | Method | Endpoint | DTO | 비고 |
| --- | --- | --- | --- | --- |
| 리소스 트리 조회 | `GET` | `/api/v1/resources` | `GetResourcesQueryDto` | `scope` 필터 필수 포함 |
| 내 권한 리소스 조회 | `GET` | `/api/v1/resources/my-resources` | 없음 | 로그인한 사용자의 가시 자원 목록 조회 |
| 권한 세트 목록 조회 | `GET` | `/api/v1/resources/permission-sets` | 없음 | 배정된 역할/권한 세트 일체 조회 |
| 리소스 상세 조회 | `GET` | `/api/v1/resources/{id}` | `IdParamDto` | 자원 상세 명세 조회 |
| 리소스 생성 | `POST` | `/api/v1/resources/create` | `CreateResourceDto` | 신규 자원 트리 삽입 수행 |
| 리소스 수정 | `POST` | `/api/v1/resources/update` | `UpdateResourceDetailBodyDto` | 메타데이터 수정 수행 |
| 리소스 권한 수정 | `POST` | `/api/v1/resources/update-permissions` | `UpdateResourcePermissionsDto` | 자원 인가 범위 변경 수행 |
| 리소스 순서 수정 | `POST` | `/api/v1/resources/update-sort` | `UpdateResourceSortDto` | 드래그 앤 드롭 연계 일괄 수정 수행 |
| 리소스 삭제 | `POST` | `/api/v1/resources/delete` | `DeleteResourceBodyDto` | 하위 트리 cascade 여부 판정 포함 |
| 권한 세트 생성 | `POST` | `/api/v1/resources/permission-sets` | `CreatePermissionSetDto` | 신규 권한 세트 생성 수행 |
| 권한 세트 퍼미션 수정 | `POST` | `/api/v1/resources/permission-sets/update-permissions` | `UpdatePermissionSetPermissionsDto` | 권한 코드 배열 매핑 수정 수행 |

---
*최종 업데이트: 2026-06-07*
