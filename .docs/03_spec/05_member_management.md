# 멤버 및 초대 관리 메뉴 기능명세서 (FE)

## 1. 개요

* 각 조직의 멤버(Manager) 정보와 권한 조회 및 변경 기능 제공.
* 신규 멤버를 이메일 기반으로 초대하고 초대 라이프사이클을 통제함.
* 구현 파일: `web/platform-admin-web/src/routes/_protected/members/index.tsx` (라우트 경로: `/members`).

## 2. 메뉴 식별 정보

| 항목 | 값 |
| --- | --- |
| 메뉴명 | 멤버 및 초대 관리 |
| 리소스 코드 | `MEMBER` |
| 리소스 유형 | `MENU` |
| 리소스 범위 | `ORGANIZATION` |
| 경로 | `/members` |
| icon | `Users` |
| 기본 권한 | `CREATE`, `READ`, `UPDATE`, `DELETE` |

## 3. 메뉴 목적

| 목적 | 설명 |
| --- | --- |
| 구성원 계정 관리 | 조직에 귀속된 멤버의 계정 활성화/비활성화 상태를 제어함. |
| 권한 및 역할 부여 | 멤버별 역할(OWNER, MANAGER, VIEWER)을 변경하여 행동 영역을 통제함. |
| 초대장 발행 및 추적 | 미가입 사용자에게 가입용 초대메일을 발송하고 대기/만료/취소 상태를 실시간 제어함. |
| 보안성 유지 | 조직 내 최소 1명의 OWNER가 상시 활성 상태를 유지하도록 시스템 제약을 보장함. |

## 4. 화면 구성

### 4.1 상단 필터 및 검색바
* **검색 필드**: 이름 또는 이메일을 키워드로 실시간 필터링 수행.
* **상태 셀렉터**: 활성 상태 필터(`ACTIVE`, `INACTIVE`) 또는 초대 상태 필터(`PENDING`, `ACCEPTED`, `EXPIRED`) 연계.
* **초대 버튼**: 신규 멤버 초대 모달 활성화.

### 4.2 멤버 목록 탭 (`MembersTab.tsx`)
* **멤버 목록 테이블**: 이름, 이메일, 역할, 가입일, 계정 활성 토글 스위치, 역할 변경 셀렉터 노출.

### 4.3 초대 관리 탭 (`InvitationsTab.tsx`)
* **초대 목록 테이블**: 초대 수신 이메일, 초대장 상태, 발송 일시, 만료 일시, 재발송/취소/복구 버튼 액션 배치.

### 4.4 모달
* **멤버 초대 모달**: 수신자 이름, 이메일 주소, 초기 역할(OWNER, MANAGER, VIEWER), 관리 메모 입력창 제공.

## 5. 데이터 모델

### 5.1 멤버 (Member)

| 필드 | 설명 |
| --- | --- |
| `id` | 멤버 고유 식별자 (UUID) |
| `name` | 멤버 이름 |
| `email` | 멤버 이메일 주소 |
| `role` | 멤버의 권한 역할 (`OWNER`, `MANAGER`, `VIEWER`) |
| `status` | 계정 활성화 상태 (`ACTIVE`, `INACTIVE`) |
| `createdAt` | 가입 및 생성 일시 |

### 5.2 멤버 초대 (MemberInvite)

| 필드 | 설명 |
| --- | --- |
| `id` | 초대장 식별자 (UUID) |
| `name` | 피초대자 이름 |
| `email` | 수신 이메일 주소 |
| `role` | 가입 시 부여할 역할 |
| `inviteStatus` | 초대 라이프사이클 상태 (`PENDING`, `ACCEPTED`, `EXPIRED`, `CANCELLED`) |
| `note` | 초대 관련 관리자 수동 메모 |
| `createdAt` | 초대장 최초 발송 일시 |

## 6. 기능 상세

### 6.1 멤버 상태 토글 및 마지막 소유자 제약 조건
* 관리자는 활성 상태 토글 스위치를 사용해 멤버 계정을 활성화/비활성화(`ACTIVE` ↔ `INACTIVE`) 처리할 수 있음.
* **[마지막 소유자 비활성화 제한 규칙]**:
  * 비활성화하려는 대상이 `OWNER` 역할인 경우, 현재 조직 내에 **활성(`ACTIVE`) 상태인 다른 `OWNER`가 최소 1명 이상 존재해야만 비활성화 허용.**
  * 대상이 조직 내 유일하게 남은 활성 `OWNER`인 경우, 비활성화 토글 시도 시 차단 팝업을 노출하며 요청 무산 처리함.

### 6.2 멤버 역할 변경
* 관리자는 콤보박스를 통해 멤버의 역할(OWNER, MANAGER, VIEWER)을 즉각 변경함.
* **[마지막 소유자 역할 변경 제한 규칙]**:
  * 역할을 `MANAGER` 또는 `VIEWER`로 격하하려는 멤버가 조직 내 유일한 활성 `OWNER`인 경우, 역할 변경 처리를 차단함.

### 6.3 초대 라이프사이클 제어
* **초대장 생성**: 이름, 이메일, 역할을 지정해 새로운 초대 정보를 저장하고 이메일을 비동기 큐를 통해 발송함.
* **초대장 재전송 (Resend)**: 이메일 유실 시 만료 전 상태에 한해 메일을 재생성하여 다시 발송함.
* **초대장 취소 (Cancel)**: 발송된 초대 링크의 토큰을 무효화하여 가입 불가능 상태로 전환함.
* **초대장 복구 (Revive)**: 만료(`EXPIRED`)된 초대장의 유효기간을 수동으로 연장하여 다시 활성화 처리함.

## 7. 상태 판정 규칙

### 7.1 멤버 상태
| 판정 기준 | UI 표시 상태 |
| --- | --- |
| `status = ACTIVE` | 활성 (초록색 배지) |
| `status = INACTIVE` | 차단/비활성 (회색 배지) |

### 7.2 초대 상태
| 판정 기준 | UI 표시 상태 |
| --- | --- |
| `inviteStatus = PENDING` | 대기 중 (노란색 배지) |
| `inviteStatus = ACCEPTED` | 가입 완료 (초록색 배지) |
| `inviteStatus = EXPIRED` | 기간 만료 (빨간색 배지) |
| `inviteStatus = CANCELLED` | 초대 취소 (회색 배지) |

## 8. 입력 검증

| 항목 | 검증 규칙 |
| --- | --- |
| 초대 이름 | 필수 입력, 공백 제외 문자열 검증 |
| 초대 이메일 | 필수 입력, 올바른 이메일 포맷 (`@` 포함) 검증 |
| 초대 역할 | 필수 선택, `OWNER`, `MANAGER`, `VIEWER` 중 하나 지정 |
| 메모 | 선택 입력, 최대 200자 제약 |

## 9. 사용자 피드백

| 상황 | 피드백 |
| --- | --- |
| 초대 발송 중 | 버튼 내 로딩 스피너 및 `초대장 전송 중...` 메시지 표시 |
| 초대 발송 성공 | 토스트 메시지 출력: `초대장 발송 완료!` |
| 유일 소유자 차단 | 경고 대화상자 노출: `조직 내 활성 상태인 소유자(Owner)가 최소 1명 존재해야 합니다.` |
| 초대장 취소 | 토스트 메시지 출력: `초대를 성공적으로 취소했습니다.` |

## 10. API 연동 기준

| 기능 | Method | Endpoint | DTO | 비고 |
| --- | --- | --- | --- | --- |
| 멤버 목록 조회 | `GET` | `/api/v1/members` | `GetMembersQueryDto` | 검색 및 역할/상태 필터링 지원 |
| 멤버 상세 조회 | `GET` | `/api/v1/members/{id}` | `IdParamDto` | 멤버 메타데이터 단건 조회 |
| 멤버 권한 변경 | `POST` | `/api/v1/members/role` | `UpdateMemberRoleDto` | 역할 수정 제약 조건 검사 수반 |
| 멤버 상태 변경 | `POST` | `/api/v1/members/status` | `ToggleMemberStatusDto` | 활성 토글 제약 조건 검사 수반 |
| 초대 목록 조회 | `GET` | `/api/v1/members/invites` | `GetInvitesQueryDto` | 초대 이력 리스트 조회 |
| 멤버 초대 생성 | `POST` | `/api/v1/members/invites` | `CreateInviteDto` | 비동기 메일 큐 전송 연계 |
| 초대장 재전송 | `POST` | `/api/v1/members/invites/resend` | `ResendInviteDto` | 만료 기간 초기화 발송 |
| 초대 취소 | `POST` | `/api/v1/members/invites/cancel` | `CancelInviteDto` | 토큰 즉시 무효화 수행 |
| 초대 복구 | `POST` | `/api/v1/members/invites/revive` | `ReviveInviteDto` | 만료된 링크 수동 복구 수행 |

---
*최종 업데이트: 2026-06-07*
