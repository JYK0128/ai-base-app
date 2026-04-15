# 개발자 가이드

* **환경 설정**: 개발 환경 구축 및 로컬 실행 지침
* **아키텍처**: 서비스별 내부 구조 및 패턴 준수 사항
* **배포**: 스테이징 및 프로덕션 배포 절차

## DB 패키지 현재 구조 (`packages/database`)

* DB 레이어는 도메인 기준으로 `application`, `audit`, `billing`, `manager`, `message`, `organization`, `rbac`, `site` 디렉토리로 분리되어 있음.
* 각 도메인은 `*.entity.ts` + `*.repository.ts` 페어를 기본 단위로 유지하고, `domains/index.ts`에서 일괄 export 하여 서비스에서 단일 진입점으로 참조함.
* 공통 베이스는 `CoreEntity`/`CoreRepository`를 사용하며, 페이지네이션 공통 로직은 `PaginationRepository`로 분리되어 있음.
* 워크스페이스 의존 관계는 `apps/platform-auth-service`, `apps/service-gateway`에서 `@pkg/database`를 직접 참조하는 구조를 기본으로 함.

## 엔티티 공통 감사 필드 및 삭제 정책

* 모든 엔티티는 `CoreEntity`를 상속하고 공통 필드 `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`를 사용함.
* 기본 삭제 정책은 soft delete이며, `delete()` 호출 시 기본값으로 `deletedAt`을 갱신함.
* 하드 삭제가 필요한 경우에만 `delete(true)` 경로를 사용함.
* MikroORM 전역 필터 `softDelete`가 기본 활성화되어 일반 조회에서 `deletedAt != null` 데이터는 자동 제외됨.

## 네이밍 및 모델링 컨벤션

* 파일 네이밍은 도메인 접두사 기반으로 통일함. (예: `manager.account.entity.ts`, `role.permission.entity.ts`, `user.account.entity.ts`)
* 관계 엔티티도 명시적으로 분리하여 관리함. (예: `ApplicationMembership`, `RolePermission`, `ManagerRole`)
* 저장소 클래스는 엔티티와 동일 접두사를 유지하고, 쿼리 확장/조회 유틸은 저장소 레이어에서 흡수함.

## 마이그레이션/시더 운영 기준

* 마이그레이션은 `packages/database/src/migrations` 경로에서 관리하고, 생성/적용은 패키지 스크립트(`migration:create`, `migration:up` 등)로만 수행함.
* 시더는 `DatabaseSeeder`를 루트 진입점으로 사용하고, `Message/Organization/Platform/Rbac/Site` 세부 시더를 조합해 초기 데이터를 구성함.
* 로컬 검증 시 `seed` 또는 `seed:reset` 스크립트를 사용해 스키마와 초기 데이터 상태를 재현함.
* 테스트는 `test:example` 스크립트(Vitest + Testcontainers) 기준으로 최소 동작 보증을 확인함.
