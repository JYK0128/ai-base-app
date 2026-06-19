# 리소스 권한 메타데이터 전환 - 2026-06-16

## 목적

`Resource.actions`를 더 이상 배열 권한 값으로 보지 않고, `metadata`의 CRUD 불리언 플래그로 분해한다.

## 대상

- `packages/database/src/domains/platform/resource/resource.entity.ts`
- `packages/database/src/seeders/resource.seeder.ts`
- `apps/platform-service/src/domains/resource/queries/get-resource.response.dto.ts`
- `apps/platform-service/src/domains/resource/queries/get-resources.response.dto.ts`

## 스펙

- `metadata.creatable`
- `metadata.readable`
- `metadata.updatable`
- `metadata.deletable`

## 비고

- 기존 응답 호환을 위해 API 응답에는 파생 `actions` 필드를 함께 유지한다.
