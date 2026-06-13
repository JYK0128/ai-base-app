# 메타데이터, 관계 및 작업 절차 (Metadata, Relations & Workflow)

## 1. Metadata / Embeddable 정의 규칙

- **타입화된 메타데이터**:
  - 구조화된 metadata는 타입 안정성 확보를 위해 typed embeddable 클래스로 정의함
- **Nested Embeddable 규칙**:
  - 상시 존재가 보장되는 정보성 컨테이너: 생성자/선언부에서 즉각 초기화(early init)함
  - 객체의 존재 유무 자체가 도메인 의미를 지니는 값: optional 필드로 유지함
- **조기 초기화 권장 (Early Initialization)**:
  - 생성자 또는 선언부에서 즉각적인 early init 구문을 사용하여 정보를 초기화함
- **예시 코드**:

  ```typescript
  @Embeddable()
  export class AnnouncementMetadata {
    [key: string]: unknown;

    constructor(data?: Partial<AnnouncementMetadata>) {
      Object.assign(this, data);
    }

    @Property({ type: Date, nullable: true })
    publishedAt?: Date;
  }

  @Embedded({ entity: () => AnnouncementMetadata, object: true, nullable: true })
  override metadata: Opt<AnnouncementMetadata> = new AnnouncementMetadata();
  ```

---

## 2. Getter / Setter 규칙

- **메서드 제약**:
  - 비즈니스 연산 또는 동적 계산이 수반되는 상태를 readonly getter로 노출하여 정의함
- **상태의 산출**:
  - 계산 로직의 기준이 하위 객체(metadata)에 있더라도, 엔티티 전체의 상태를 대표하는 값은 Aggregate Root 엔티티에 getter로 정의함
  - 하위 embeddable은 상태 연산 로직을 최소화하고 순수 데이터 컨테이너 역할을 수행하도록 함
- **예시 코드**:

  ```typescript
  get isActive(): Opt<boolean> {
    return this.status === MemberStatus.ACTIVE;
  }
  ```

---

## 3. Relations 선언 규칙

- **관계 선언 표준**:
  - Required 관계: `field!: Rel<T>` 구문 사용
  - Nullable 관계: `@ManyToOne(() => Entity, { nullable: true })` 및 `field?: Rel<T>` 구문 사용
  - One-to-Many 관계: `new Collection<T>(this)` 구문을 사용하여 항상 기본 인스턴스를 즉각 생성 및 할당함
- **예시 코드**:

  ```typescript
  import { Organization } from '../organization/organization.entity';
  import { MemberAccount } from './member.account.entity';

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization>;

  @OneToMany(() => MemberAccount, (account) => account.member)
  accounts = new Collection<MemberAccount>(this);
  ```

---

## 4. Repository 구성 규칙

- **리포지토리 정의**:
  - 모든 엔티티는 개별 파일 단위의 전용 repository 클래스를 정의함
- **데코레이터 바인딩**:
  - 엔티티 클래스 선언부 데코레이터 내에 데이터베이스 `schema` 명과 바인딩할 `repository` 클래스를 명시적으로 지정함
- **예시 코드**:
  - 리포지토리 파일 (`*.repository.ts`):

    ```typescript
    import { EntityRepository } from '@mikro-orm/postgresql';
    import { MyEntity } from './my.entity';

    export class MyEntityRepository extends EntityRepository<MyEntity> {}
    ```

  - 엔티티 파일 (`*.entity.ts`):

    ```typescript
    @Entity({ schema: 'platform', repository: () => MyEntityRepository })
    export class MyEntity extends CoreEntity<MyEntity> {}
    ```

---

## 5. Gateway DTO와 엔티티 간 타입 동기화 및 단일 진실 공급원 규칙

- **적용 목적**: 데이터베이스 엔티티와 타입 정합성을 유지하면서 중복 선언 최소화 및 API 프레젠테이션 계층의 데코레이터와 엔티티 간 관심사 분리
- **DTO 규칙 (요청 및 응답 DTO 공통)**:
  - **구현 방식**: `implements Pick<Entity, Keys>` 구문을 적용하여 타입 호환성 강제
  - **작성 규칙**: 클래스 본문은 `override` 키워드 없는 순수 멤버 변수로 선언하고 `@ApiProperty` / `@ApiPropertyOptional` 및 `class-validator`를 명시적으로 선언
  - **동작 특징**: 엔티티 스펙 변경 시 빌드 타임에 DTO 타입 오류가 자동 발생하여 실시간 동기화 보장
- **요청 DTO 예시**:

  ```typescript
  import { ApiProperty } from '@nestjs/swagger';
  import { MemberInvite } from '@pkg/database';
  import { IsEmail, IsString } from 'class-validator';

  export class CreateInviteDto implements Pick<MemberInvite, 'name' | 'email'> {
    @ApiProperty({ example: '김개발', description: '이름' })
    @IsString()
    name!: string;

    @ApiProperty({ example: 'dev@example.com', description: '이메일' })
    @IsEmail()
    email!: string;
  }
  ```

- **응답 DTO 예시**:

  ```typescript
  import { ApiProperty } from '@nestjs/swagger';
  import { Member, MemberStatus } from '@pkg/database';

  export class MemberResponseDto implements Pick<Member, 'id' | 'name' | 'status' | 'createdAt'> {
    @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
    id!: string;

    @ApiProperty({ example: '김개발', description: '이름' })
    name!: string;

    @ApiProperty({ enum: MemberStatus, example: 'ACTIVE', description: '상태' })
    status!: MemberStatus;

    @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
    createdAt!: Date;
  }
  ```

---

## 6. 작업 절차

- **절차 통합**:
  - 엔티티 변경 사항을 프로젝트에 반영할 시 공통 `coding-standard-guide` 스킬을 의무적으로 병행하여 수행함
- **주요 점검 사항**:
  - 스키마 변경에 따른 영향 범위 사전 진단
  - 엔티티 데이터와 매핑되는 DTO, Mapper, API 계약 정합성 검토 (엔티티 필드 수정 시 이를 상속하는 DTO 파일들의 타입 오류가 자동 컴파일 단계에서 감지됨)
  - `@pkg/database build` 명령을 실행하여 `metadata.json` 및 dist 타입의 일괄 갱신 수행
  - 타입체크, 린트(eslint, stylelint), 프로젝트 빌드 등 통합 검증 단계 수행
