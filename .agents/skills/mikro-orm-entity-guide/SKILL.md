---
name: mikro-orm-entity-guide
description: MikroORM 엔티티를 작성하거나 수정할 때 사용하는 가이드입니다. CoreEntity 상속, Repository 패턴, 파일 네이밍 규칙, 스키마 정의 등을 강제합니다. 사용자가 "엔티티 생성", "DB 테이블 추가", "Entity 작성" 등을 요청할 때 이 스킬을 사용하세요.
---

# MikroORM Entity Creation Guide

이 스킬은 프로젝트의 데이터베이스 엔티티를 일관된 포맷으로 작성하기 위한 지침을 제공합니다.

## 1. 파일 네이밍 규칙

- 엔티티 파일: `[domain].[name].entity.ts` (예: `terms.version.entity.ts`, `manager.terms.consent.entity.ts`)
- 리포지토리 파일: `[domain].[name].repository.ts` (예: `terms.version.repository.ts`)
- 위치: `packages/database/src/domains/[schema]/[sub-domain]/`

## 2. 엔티티 구조 및 데코레이터

### 기본 필수 사항

- 모든 엔티티는 `CoreEntity`를 상속받아야 합니다.
- `@mikro-orm/decorators/legacy` 패키지의 데코레이터를 사용합니다.
- `@Entity` 데코레이터에 `schema`와 `repository`를 명시합니다.

### Imports 가이드

```typescript
import { Collection, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';
import { CoreEntity } from '../../core/core.entity';
// ... 필요한 레포지토리 및 관계 엔티티 임포트
```

### 클래스 정의 예시

```typescript
@Entity({ schema: 'platform', repository: () => MyEntityRepository })
export class MyEntity extends CoreEntity<MyEntity, 'optionalProp'> {
  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Enum(() => MyStatus)
  status: MyStatus = MyStatus.DRAFT;

  @ManyToOne(() => OtherEntity)
  otherEntity!: Rel<OtherEntity>;

  @OneToMany(() => ChildEntity, (child) => child.parent)
  children = new Collection<ChildEntity>(this);
}
```

## 3. 관계 정의 (Relationships)

- **ManyToOne**: `Rel<T>` 타입을 사용하고 `!` (non-null assertion) 또는 `?` (optional)를 적절히 사용합니다.
- **OneToMany**: `Collection<T>` 타입을 사용하고 클래스 멤버 변수에서 `new Collection<T>(this)`로 초기화합니다.
- **Enum**: `@Enum(() => EnumType)` 데코레이터를 사용합니다.

## 4. Repository 작성

엔티티와 동일한 디렉토리에 리포지토리 파일을 생성합니다.

```typescript
import { EntityRepository } from '@mikro-orm/postgresql';
import { MyEntity } from './my.entity';

export class MyEntityRepository extends EntityRepository<MyEntity> {}
```

## 5. 작성 시 주의사항

1. **ID 및 공통 필드**: `id`, `createdAt`, `updatedAt`, `deletedAt` 등은 `CoreEntity`에 이미 정의되어 있으므로 중복 정의하지 마세요.
2. **Schema**: 폴더 구조에 따라 `platform`, `core` 등의 적절한 스키마를 지정하세요.
3. **Legacy Decorators**: 반드시 `@mikro-orm/decorators/legacy`에서 데코레이터를 가져오세요.
4. **Circular Dependencies**: 관계 설정 시 필요하다면 `type Rel`을 사용하여 순환 참조 문제를 방지하세요.
