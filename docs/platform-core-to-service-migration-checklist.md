# Platform Core to Service Migration Checklist

- [x] `announcement` - 공지사항 목록 조회를 `platform-service`로 이관
- [x] `i18n/locales` - 활성 로케일 목록 조회를 `platform-service`로 이관
- [x] `resource` - 리소스 조회 기능을 `platform-service`로 이관
- [ ] `members` - 멤버 조회 기능을 `platform-service`로 이관
  - [x] `members/detail` - 멤버 상세 조회를 `platform-service`로 이관
  - [x] `members/list` - 멤버 목록 조회를 `platform-service`로 이관
  - [x] `members/invite-create` - 멤버 초대 생성 및 메일 발송을 `platform-service`로 이관
- [x] `organization` - 조직 조회 기능을 `platform-service`로 이관
- [x] `support` - 티켓 조회 기능을 `platform-service`로 이관
- [ ] `terms` - 약관 조회 기능을 `platform-service`로 이관
  - [x] `terms/active` - 활성 약관 목록 조회를 `platform-service`로 이관
  - [x] `terms/documents` - 약관 문서 목록 조회를 `platform-service`로 이관
  - [x] `terms/document-detail` - 약관 문서 상세 조회를 `platform-service`로 이관
  - [x] `terms/document-versions` - 약관 버전 목록 조회를 `platform-service`로 이관
- [x] `mail` - 메일 이벤트/전송 흐름을 `platform-service`로 이관
