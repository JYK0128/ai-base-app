# Platform Core to Service Migration Checklist

- [x] `announcement` - 공지사항 목록 조회를 `platform-service`로 이관
- [x] `i18n/locales` - 활성 로케일 목록 조회를 `platform-service`로 이관
- [x] `resource` - 리소스 조회 기능을 `platform-service`로 이관
- [ ] `members` - 멤버 조회 기능을 `platform-service`로 이관
- [x] `organization` - 조직 조회 기능을 `platform-service`로 이관
- [x] `support` - 티켓 조회 기능을 `platform-service`로 이관
- [ ] `terms` - 약관 조회 기능을 `platform-service`로 이관
  - [x] `terms/active` - 활성 약관 목록 조회를 `platform-service`로 이관
  - [x] `terms/documents` - 약관 문서 목록 조회를 `platform-service`로 이관
  - [x] `terms/document-detail` - 약관 문서 상세 조회를 `platform-service`로 이관
  - [ ] `terms/document-versions` - 약관 버전 목록 조회를 `platform-service`로 이관
- [ ] `mail` - 메일 이벤트/전송 흐름을 `platform-service`로 이관
