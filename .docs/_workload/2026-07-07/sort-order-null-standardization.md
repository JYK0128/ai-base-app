# sortOrder Null 표준화 - 2026-07-07

## 📋 작업 체크리스트

- [x] `sortOrder` 엔티티 선언을 `number | null = null`로 통일
  - 시작: 2026-07-07 14:19
  - 완료: `[verified]`
- [x] `sortOrder` 응답/정렬 로직을 null 기준으로 갱신
  - 시작: 2026-07-07 14:19
  - 완료: `[verified]`
- [x] `@pkg/database build` 및 API 생성 경로 확인
  - 시작: 2026-07-07 14:19
  - 완료: `[verified]`

## 📋 정리 결과

- `Resource.sortOrder`, `I18nLocale.sortOrder`, `OrganizationRole.sortOrder`를 `number | null = null`로 통일함
- `Resource` 계열 정렬 비교에서 `null`과 `undefined`를 함께 비어있는 값으로 처리함
- `platform-service`와 `platform-admin-web` 타입검사 및 린트가 모두 통과함
- API 생성은 이번 변경에서 실행하지 않음
