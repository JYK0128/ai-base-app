# 기본 원칙 및 파일 구조 (Basics & File Structure)

## 1. 기본 원칙

- 모든 엔티티는 `CoreEntity<Entity>`를 상속받음
- Kysely 등 쿼리 빌더와의 타입 정합성 및 타입 추론을 위해 엔티티 클래스 내부에 `[EntityName]?: 'EntityName'` 심볼 선언을 필수로 포함함
- 생성 시 생략 가능한 기본값 필드는 해당 필드 타입에 직접 `Opt<T>`를 지정함
- 데코레이터는 `@mikro-orm/decorators/legacy` 패키지에서 임포트함
- 관계 타입 선언 시 `Rel<T>`를 활용하며 type-only import 적용을 우선함
- 엔티티 수정 후 `@pkg/database build` 명령어로 `metadata.json` 및 `dist/index.d.ts` 파일을 갱신함

---

## 2. 파일 구조

- **엔티티 파일**: `[domain]-[name].entity.ts` 규격 준수 (예: `member-invite.entity.ts`)
- **정책(Policy) 파일**: `[domain]-[name].policy-status.ts` 규격 준수 (비즈니스 상태 판별 함수 분리)
- **상수(Constants) 파일**: `[domain].constants.ts` 규격 준수 (도메인 범위 상수/Enum 분리)
- **경로 표준**: `packages/database/src/domains/[schema]/[sub-domain]/`
  - 예시:

    ```text
    packages/database/src/domains/platform/member/member-invite.entity.ts
    packages/database/src/domains/platform/member/member-invite.policy-status.ts
    packages/database/src/domains/platform/member/member.constants.ts
    ```

> [!NOTE]
> 개편에 따라 개별 엔티티 단위의 리포지토리 파일(`*.repository.ts`)은 원칙적으로 생성하지 않으며, `@Entity` 데코레이터 선언 시 `repository` 옵션을 바인딩하지 않고 `schema`만 지정합니다.

---

## 3. Imports

- 필요한 모듈만 임포트하고 타입은 type-only 구문으로 철저히 분리함
- 예시 코드:

  ```typescript
  import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
  import { Embeddable, Embedded, Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

  import { CoreEntity } from '../../core/core.entity';
  ```

- **임포트 가이드**:
  - `Collection`, `EntityName` 등 런타임 클래스 및 심볼: 일반 `import` 구문 사용
  - `Opt`, `Rel` 등 순수 타입 정보: `type-only import` 사용 권장

