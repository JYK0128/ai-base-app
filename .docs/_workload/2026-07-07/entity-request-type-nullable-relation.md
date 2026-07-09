# Entity Request Type Nullable Relation - 2026-07-07

## 📋 작업 체크리스트

- [x] `EntityRequestType`의 nullable relation 타입 보정
  - 시작: 2026-07-07 18:45
  - 완료: `[verified]`

## 📋 정리 결과

- `EntityRequestType`의 object relation 분기가 `null`을 보존하도록 갱신됨
- `UpdateResourceSortItemDto.parent`의 `string | null` override가 공통 타입과 정합해짐
- `platform-service` 타입검사와 린트가 통과함
