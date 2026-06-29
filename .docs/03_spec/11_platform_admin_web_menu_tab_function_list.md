# platform-admin-web 메뉴 / 탭 / 기능 목록

기준: `web/platform-admin-web`

| 구분 | 메뉴 / 화면 | 탭 | 기능 | 라우트 | API 연동 | 검증 결과 | 근거 파일 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 공통 | 공통 레이아웃 | 없음 | 사이드바 메뉴 동적 렌더링 | `_protected` | 연동 | 미검증 | `web/platform-admin-web/src/routes/_protected.tsx` |
| 공통 | 공통 레이아웃 | 없음 | 언어 선택, 로그아웃 | `_protected` | 연동 | 미검증 | `web/platform-admin-web/src/routes/_protected.tsx` |
| 공통 | 접근 제어 | 없음 | 인증 미보유 시 로그인 이동 | `_protected` -> `/login` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected.tsx` |
| 공통 | 접근 제어 | 없음 | 약관 재동의 필요 시 약관 동의 이동 | `_protected` -> `/term-agreement` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected.tsx` |
| 공통 | 접근 제어 | 없음 | 비밀번호 변경 필요 시 비밀번호 변경 이동 | `_protected` -> `/change-password` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected.tsx` |
| 공통 | 접근 제어 | 없음 | 로그인 상태일 때 대시보드 이동 | `_public/login` -> `/dashboard` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/login.tsx` |
| 공통 | 접근 제어 | 없음 | 비밀번호 변경 완료 후 대시보드 이동 | `_public/change-password` -> `/dashboard` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/change-password.tsx` |
| 공통 | 접근 제어 | 없음 | 약관 동의 완료 후 대시보드 이동 | `_public/term-agreement` -> `/dashboard` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/term-agreement.tsx` |
| 보호 메뉴 | 대시보드 | 없음 | 차트 이미지 영역 표시, 기본 진입 화면 렌더링 | `/dashboard` | 미연동 | Pass | `web/platform-admin-web/src/routes/_protected/dashboard/index.tsx` |
| 보호 메뉴 | 조직 관리 | 기본 정보 | 조직정보 수정 및 저장 | `/organizations` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/organizations/-tabs/OrganizationOverviewTab.tsx` |
| 보호 메뉴 | 조직 관리 | 활동 기록 | 조직활동 타임라인 확인 | `/organizations` | 미연동 | Pass | `web/platform-admin-web/src/routes/_protected/organizations/-tabs/OrganizationActivityTab.tsx` |
| 보호 메뉴 | 멤버 관리 | 멤버 목록 | 멤버 조회 | `/members` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/members/-tabs/MembersTab.tsx` |
| 보호 메뉴 | 멤버 관리 | 멤버 목록 | 권한 변경 | `/members` | 연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/members/-tabs/MembersTab.tsx` |
| 보호 메뉴 | 멤버 관리 | 멤버 목록 | 상태 전환 | `/members` | 연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/members/-tabs/MembersTab.tsx` |
| 보호 메뉴 | 멤버 관리 | 멤버 목록 | 상세 드로어 확인 | `/members` | 미연동 | Pass | `web/platform-admin-web/src/routes/_protected/members/-tabs/MembersTab.tsx` |
| 보호 메뉴 | 멤버 관리 | 초대 목록 | 초대 생성 | `/members` | 연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/members/-tabs/InvitationsTab.tsx` |
| 보호 메뉴 | 멤버 관리 | 초대 목록 | 초대 이력 확인 | `/members` | 미연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/members/-tabs/InvitationsTab.tsx` |
| 보호 메뉴 | 리소스 관리 | 없음 | 리소스 트리 조회 | `/resources` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/resources/-tabs/ResourceTreeTab.tsx` |
| 보호 메뉴 | 리소스 관리 | 없음 | 메뉴 구조, scope, 허용 액션 확인 | `/resources` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/resources/-tabs/ResourceTreeTab.tsx` |
| 보호 메뉴 | 권한 관리 | 없음 | 역할 권한 조회 | `/permissions` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/resources/-tabs/PermissionManagementTab.tsx` |
| 보호 메뉴 | 권한 관리 | 없음 | 리소스 권한 맵 확인 | `/permissions` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/resources/-tabs/PermissionManagementTab.tsx` |
| 보호 메뉴 | 약관 관리 | 없음 | 약관 문서 목록 조회 | `/terms` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/terms/-tabs/TermsManagementTab.tsx` |
| 보호 메뉴 | 약관 관리 | 없음 | 약관 문서 상세 조회 | `/terms` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/terms/-tabs/TermsManagementTab.tsx` |
| 보호 메뉴 | 약관 관리 | 없음 | 버전 목록 확인 | `/terms` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/terms/-tabs/TermsManagementTab.tsx` |
| 보호 메뉴 | 공지사항 관리 | 없음 | 공지 목록 조회 | `/announcements` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/announcements/-tabs/AnnouncementListTab.tsx` |
| 보호 메뉴 | 공지사항 관리 | 없음 | 검색 | `/announcements` | 미연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/announcements/-tabs/AnnouncementListTab.tsx` |
| 보호 메뉴 | 공지사항 관리 | 없음 | 작성 | `/announcements` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/announcements/-modals/AnnouncementEditorModal.tsx` |
| 보호 메뉴 | 공지사항 관리 | 없음 | 수정 | `/announcements` | 연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/announcements/-modals/AnnouncementEditorModal.tsx` |
| 보호 메뉴 | 공지사항 관리 | 없음 | 삭제 | `/announcements` | 연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/announcements/-modals/AnnouncementPreviewModal.tsx` |
| 보호 메뉴 | 공지사항 관리 | 없음 | 미리보기 | `/announcements` | 미연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/announcements/-modals/AnnouncementPreviewModal.tsx` |
| 보호 메뉴 | 감사 로그 | 없음 | 로그 검색 | `/audit` | 미연동 | Pass | `web/platform-admin-web/src/routes/_protected/audit/index.tsx` |
| 보호 메뉴 | 감사 로그 | 없음 | 액션, 상태 필터 | `/audit` | 미연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/audit/index.tsx` |
| 보호 메뉴 | 감사 로그 | 없음 | 상세 JSON 확인 | `/audit` | 미연동 | Pass | `web/platform-admin-web/src/routes/_protected/audit/index.tsx` |
| 보호 메뉴 | 고객 지원 | 없음 | 티켓 목록 조회 | `/support` | 연동 | Pass | `web/platform-admin-web/src/routes/_protected/support/index.tsx` |
| 보호 메뉴 | 고객 지원 | 없음 | 티켓 상세 확인 | `/support` | 미연동 | 미검증 | `web/platform-admin-web/src/routes/_protected/support/index.tsx` |
| 공개 화면 | 로그인 | 없음 | 이메일, 비밀번호 로그인 | `/login` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/login.tsx` |
| 공개 화면 | 로그인 | 없음 | 비밀번호 찾기 이동 | `/login` | 미연동 | 미검증 | `web/platform-admin-web/src/routes/_public/login.tsx` |
| 공개 화면 | 비밀번호 변경 | 없음 | 현재 비밀번호, 새 비밀번호, 확인 입력 후 변경 | `/change-password` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/change-password.tsx` |
| 공개 화면 | 약관 동의 | 없음 | 플랫폼 약관 동의 | `/term-agreement` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/term-agreement.tsx` |
| 공개 화면 | 약관 동의 | 없음 | 조직 약관 동의 | `/term-agreement` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/term-agreement.tsx` |
| 공개 화면 | 약관 동의 | 없음 | 동의 후 대시보드 이동 | `/term-agreement` | 연동 | Pass | `web/platform-admin-web/src/routes/_public/term-agreement.tsx` |
| 공개 화면 | 비밀번호 찾기 | 없음 | 이메일 입력 후 재설정 안내 | `/forgot-password` | 미연동 | Pass | `web/platform-admin-web/src/routes/_public/forgot-password.tsx` |

## 시나리오 테스트 결과

검증 방식: Playwright 실제 브라우저 시나리오

사용 계정: `admin@platform.com` / `pass1234`

| 페이지 | 시나리오 | 결과 | 비고 |
| --- | --- | --- | --- |
| 로그인 | 빈 제출 시 필수값 검증 | Pass | 이메일/비밀번호 필수 에러 확인 |
| 로그인 | 로그인 성공 후 대시보드 이동 | Pass | `/dashboard` 이동 확인 |
| 비밀번호 찾기 | 빈 제출 시 필수값 검증 | Pass | 이메일 필수 에러 확인 |
| 비밀번호 찾기 | 안내 메일 제출 경로 | Pass | 현재는 안내 화면 기준 동작 확인 |
| 비밀번호 변경 | 직접 진입 가드 | Pass | 권한 없을 때 `/login` 이동 확인 |
| 약관 동의 | 직접 진입 가드 | Pass | 권한 없을 때 `/login` 이동 확인 |
| 대시보드 | 차트 이미지 영역 렌더링 | Pass | 기본 진입 화면 확인 |
| 조직 관리 | 기본 정보/활동 기록 탭 전환 | Pass | 탭 전환 후 기본 값 확인 |
| 조직 관리 | 현재 값 저장 경로 | Pass | 저장 토스트 확인 |
| 멤버 관리 | 상세 드로어 열기/닫기 | Pass | 멤버 상세 확인 |
| 멤버 관리 | 초대 드로어 열기/닫기 | Pass | 초대 생성 드로어 확인 |
| 리소스 관리 | 리소스 트리 렌더링 | Pass | 서버 리소스 목록 확인 |
| 리소스 관리 | 안내 문구 렌더링 | Pass | 생성/수정/삭제 미지원 문구 확인 |
| 권한 관리 | 역할 전환 후 권한 수 갱신 | Pass | `Owner` / `Member` / `Viewer` 수치 확인 |
| 약관 관리 | 문서 선택 시 상세 갱신 | Pass | 문서 상세/버전 목록 확인 |
| 공지사항 관리 | 빈 상태 렌더링 | Pass | `No results.` 확인 |
| 공지사항 관리 | 생성 모달 필수값 검증 | Pass | 제목/본문 필수 에러 확인 |
| 고객 지원 | 빈 상태 렌더링 | Pass | 현재 데이터 없음 확인 |
| 감사 로그 | 검색 / 새로고침 / 상세 모달 | Pass | 필터링과 상세 팝업 확인 |

## 파일별 검증 상태

- `web/platform-admin-web/src/routes/_protected/resources/-tabs/ResourceTreeTab.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/resources/-tabs/PermissionManagementTab.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/terms/-tabs/TermsManagementTab.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/members/-tabs/MembersTab.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/members/-tabs/InvitationsTab.tsx`
  - 검증 결과: 미검증
- `web/platform-admin-web/src/routes/_protected/organizations/-tabs/OrganizationOverviewTab.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/organizations/-tabs/OrganizationActivityTab.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/announcements/-tabs/AnnouncementListTab.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/announcements/-modals/AnnouncementEditorModal.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/announcements/-modals/AnnouncementPreviewModal.tsx`
  - 검증 결과: 미검증
- `web/platform-admin-web/src/routes/_protected/audit/index.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_protected/support/index.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_public/login.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_public/change-password.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_public/term-agreement.tsx`
  - 검증 결과: Pass
- `web/platform-admin-web/src/routes/_public/forgot-password.tsx`
  - 검증 결과: Pass

## 기준 메모

- `API 연동`은 화면이 실제 백엔드 계약과 연결되어 있으면 `연동`, 아니면 `미연동`으로 표기
- `검증 결과`는 `Pass`, `Fail`, `미검증`만 사용
- `대시보드`의 기본 화면은 차트 이미지 영역 표시 기준으로 정리함
