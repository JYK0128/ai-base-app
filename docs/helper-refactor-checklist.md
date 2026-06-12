# Helper Refactor Checklist

목표: `apps/platform-service/src/domains/**/**/*.helper.ts`에 남아 있는 책임을 feature-local 파일로 옮기고, helper 파일을 단계적으로 제거한다.

## 작업 규칙

- 각 작업은 한 helper 파일 또는 같은 성격의 아주 작은 묶음만 포함한다.
- 작업 1개가 끝날 때마다 `git commit` 한다.
- 작업 완료 기준은 `rg`로 helper 참조가 사라졌는지 확인하고, 필요하면 `lint`와 `build`를 통과시키는 것이다.

## 작업 순서

### 1. members helper 정리
- `members.helper.ts`의 `Member -> MemberResponseDto` 매핑을 `get-member` feature로 이동한다.
- helper import를 제거하고, 단건 조회 응답 생성은 feature 내부에서 처리한다.
- 완료 후 커밋한다.

### 2. announcement helper 정리
- `announcement.helper.ts`의 공지 응답 생성 로직을 `get-announcements` feature로 이동한다.
- helper import를 제거한다.
- 완료 후 커밋한다.

### 3. i18n helper 정리
- `i18n.helper.ts`의 로케일 응답 생성 로직을 `locales/get-locales` feature로 이동한다.
- helper import를 제거한다.
- 완료 후 커밋한다.

### 4. organization helper 정리
- `organization.helper.ts`의 조직 응답 생성 로직을 `queries/get-organizations` feature로 이동한다.
- helper import를 제거한다.
- 완료 후 커밋한다.

### 5. support helper 정리
- `support.helper.ts`의 티켓 응답 생성 로직을 `queries/get-tickets` feature로 이동한다.
- helper import를 제거한다.
- 완료 후 커밋한다.

### 6. mail helper 정리
- `mail.helper.ts`의 에러 문자열 정규화 책임을 mail command 내부 또는 별도 범용 유틸 위치로 이동한다.
- helper 이름이 필요 없는지 먼저 확인한 뒤 제거 가능하면 삭제한다.
- 완료 후 커밋한다.

### 7. auth helper 분리
- `auth.helper.ts`의 `AuthKeyBuilder`와 `extractPermissions`를 분리한다.
- 캐시 키 관련 책임은 auth cache 쪽으로, 권한 추출은 auth 유스케이스 가까이로 옮긴다.
- helper 파일이 남지 않으면 제거한다.
- 완료 후 커밋한다.

### 8. terms helper 정리
- `terms.helper.ts`의 응답 매핑과 `getCurrentPublishedVersion` 책임을 각 terms query feature로 분리한다.
- `get-active-terms`, `get-terms-document`, `get-terms-documents`, `get-terms-document-versions` 각각의 소유권을 명확히 한다.
- helper 파일을 제거한다.
- 완료 후 커밋한다.

### 9. resource helper 정리
- `resource.helper.ts`의 리소스 상세, 트리, permission set 응답 생성 책임을 feature별로 분리한다.
- 트리 구성 로직은 `get-resources`에, 상세 응답은 `get-resource`에, permission set 응답은 `get-permission-sets`에 둔다.
- helper 파일을 제거한다.
- 완료 후 커밋한다.

## 최종 확인

- `rg --files apps/platform-service/src/domains | rg 'helper\\.ts$'`로 남은 helper 목록을 확인한다.
- 각 helper import가 feature-local 구현으로 대체됐는지 확인한다.
- `pnpm --dir apps/platform-service lint`
- `pnpm --dir apps/platform-service build`
