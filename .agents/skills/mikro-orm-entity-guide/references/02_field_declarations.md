# 필드 선언 규칙 (Field Declarations)

## 1. 필드 선언 규칙

- **데코레이터 규칙**:
  - 모든 scalar 필드는 `type` 속성을 반드시 명시적으로 선언함 (예: `@Property({ type: 'string' })`)
- **작성 형태**:
  - 필수(Required) 필드: `field!: Type`
  - Nullable 필드: `@Property({ type: 'string', nullable: true }) field?: Type`
  - 생략 가능(Optional with Default) 필드: `field: Opt<Type> = defaultValue`
  - 필드 옵션(unique, hidden, nullable 등)은 단일 `@Property({ ... })` 객체 내에 병합하여 정의함
- **예시 코드**:

  ```typescript
  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', nullable: true })
  description?: string;

  @Property({ type: 'number' })
  sortOrder: Opt<number> = 0;
  ```

- **주요 Type 선언 매핑**:
  - String: `@Property({ type: 'string' }) email!: string;`
  - Text: `@Property({ type: 'text' }) content!: string;`
  - Boolean: `@Property({ type: 'boolean' }) required: Opt<boolean> = false;`
  - Date: `@Property({ type: Date }) effectiveAt!: Date;`
  - JSON: `@Property({ type: 'json' }) config: Opt<Record<string, unknown>> = {};`
  - Enum: `@Enum(() => MemberStatus) status: Opt<MemberStatus> = MemberStatus.ACTIVE;`
- **Optional 규칙**:
  - 필드 자체에 `Opt`를 붙여 의도를 선언부에서 즉각 드러내어 정의함

---

## 2. CoreEntity 규칙

- **상속 기본**: `id`, `createdAt`, `updatedAt`, `deletedAt`, `metadata` 등 `CoreEntity` 기본 필드는 하위 엔티티에서 중복 정의하지 않음
- **시스템 필드**: `id`, `createdAt`은 시스템 수준 필드로 기본 정의 상태를 일관성 있게 유지함
- **도메인 필드**: 생성 시 기본값이 필요한 개별 도메인 필드만 엔티티에서 `Opt<T>` 형식으로 직접 처리함

---

## 3. Date / At 필드 규칙

- **타입 표준**: 엔티티 및 embeddable 내 모든 `*At` 시간 필드는 `Date` 타입 사용을 원칙으로 함
- **인터페이스 분리**: 엔티티 내부는 `Date` 타입을 유지하며, API 경계(요청/응답)와의 변환은 mapper 레이어에서 처리함
- **날짜 필드 분리**: 도메인 의미가 명확히 다른 시각 정보(예: 게시 시각 `publishedAt` vs 노출 기간 `startAt`/`endAt`)는 개별 필드로 분리하여 유지함
- **예시 코드**:

  ```typescript
  @Property({ type: Date, nullable: true })
  publishedAt?: Date;
  ```

---

## 4. Enum 정의 규칙

- **Enum 선언**: 고정된 값 집합은 반드시 엔티티 enum으로 명시하고 `@Enum` 데코레이터를 사용하여 선언함
- **중복 방지**: `@pkg/database`에 정의된 공통 enum 타입을 각 서비스 레이어에서 임포트하여 일관성 있게 활용함
- **예시 코드**:

  ```typescript
  export enum AnnouncementPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
  }

  @Enum({ items: () => AnnouncementPriority, nullable: true })
  priority?: AnnouncementPriority;
  ```
