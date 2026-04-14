# 개발자 가이드

* **환경 설정**: 개발 환경 구축 및 로컬 실행 지침
* **아키텍처**: 서비스별 내부 구조 및 패턴 준수 사항
* **배포**: 스테이징 및 프로덕션 배포 절차

## i18n DB 관리 뼈대

* 공통 메시지 관리 도구는 `packages/utils`의 `I18nMessageManager`, `DatabaseI18nMessageManager`를 사용함.
* DB 영속화는 `MikroOrmI18nMessageRepository`를 통해 수행하며, 저장 단위는 `locale + namespace + key + message`로 통일함.
* 영속 엔티티는 `packages/database`의 `I18nMessage`를 사용함.
* 서비스 부팅 시 `syncFromDatabase()`를 1회 실행해 로케일/네임스페이스 캐시를 초기화함.

## 엔티티 공통 감사 필드

* 모든 엔티티는 `packages/database/src/entities/BaseEntity`를 상속함.
* 공통 필드는 `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`를 사용함.
* `deletedAt` 기반 soft delete 필터(`softDelete`)가 기본 활성화되어 일반 조회에서 삭제 데이터는 제외됨.

## RBAC DB 관리

* RBAC 엔티티는 `RbacRole`, `RbacPermission`, `RbacRolePermission`, `RbacUserRole`를 사용함.
* 권한 체크는 `packages/utils`의 `DatabaseRbacManager.hasPermission()`으로 수행함.
* DB 연동 구현체는 `MikroOrmRbacRepository`를 사용하며, 역할/권한/사용자-역할 매핑의 CUD 이력을 `BaseEntity` 감사 필드로 추적함.
