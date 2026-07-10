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

    constructor(data?: Partial<AnnouncementMetadata>) {
      Object.assign(this, data);
    }

    @Property({ type: Date })
    publishedAt!: Date;
  }

  @Entity({ schema: 'platform' })
  export class Announcement extends CoreEntity<Announcement> {
    [EntityName]?: 'Announcement';

    @Embedded({ entity: () => AnnouncementMetadata, object: true })
    override metadata: Opt<AnnouncementMetadata> = new AnnouncementMetadata();
  }
  ```

---

## 2. Getter / Setter 및 Policy 정의 규칙

- **엔티티 내부 표현 우선**:
  - 엔티티의 현재 필드만으로 즉시 판단 가능한 단순 파생값은 getter로 노출함
  - getter는 외부 인터페이스를 안정적으로 제공하는 용도로 사용하고, DB 저장 필드가 아닌 값은 `@Property({ persist: false })`를 명시함
- **Policy 파일 분리 기준**:
  - 엔티티가 직접 보유한 값을 단순히 반환하거나 null/undefined를 정규화하는 getter는 엔티티 안에 유지함
  - 상태 산출, 가입 가능 여부, 만료 여부처럼 여러 필드 조건이 결합되고 여러 곳에서 재사용되는 도메인 판단 규칙은 policy 파일로 분리함
  - policy 파일은 도메인 용어를 드러내는 함수 이름을 사용하고, 엔티티/metadata 등 필요한 값만 인자로 받는 순수 판단 함수로 작성함
  - 모든 getter와 모든 조건식을 policy로 분리하지 않음
- **readonly getter 노출**:
  - 분리된 policy 함수가 존재하는 경우 Aggregate Root 엔티티의 readonly getter에서 호출하여 외부 인터페이스를 일관되게 노출할 수 있음
- **예시 코드**:
  - `member-invite.policy-status.ts`:

    ```typescript
    import { MemberInviteStatus } from './member.constants';
    import type { MemberInviteMetadata } from './member-invite.entity';

    export function getMemberInviteStatus(
      metadata: Pick<MemberInviteMetadata, 'acceptedAt' | 'cancelAt' | 'sentAt'> | undefined,
    ): MemberInviteStatus {
      if (metadata?.acceptedAt) return MemberInviteStatus.ACCEPTED;
      if (metadata?.cancelAt) return MemberInviteStatus.CANCELED;
      if (metadata?.sentAt) return MemberInviteStatus.PENDING;
      return MemberInviteStatus.QUEUED;
    }
    ```

  - `member-invite.entity.ts`:

    ```typescript
    import { getMemberInviteStatus } from './member-invite.policy-status';

    @Property({ persist: false })
    get status(): Opt<MemberInviteStatus> {
      return getMemberInviteStatus(this.metadata);
    }
    ```

---

## 3. Relations 선언 규칙

- **관계 선언 표준**:
  - Required 관계: `field!: Rel<T>` 구문 사용
  - Nullable 관계: `@ManyToOne(() => Entity, { nullable: true })` 및 `field: Rel<T> | null = null` 구문 사용
  - One-to-Many 관계: `new Collection<T>(this)` 구문을 사용하여 항상 기본 인스턴스를 즉각 생성 및 할당함
- **예시 코드**:

  ```typescript
  import { Organization } from '../organization/organization.entity';
  import { MemberAccount } from './member-account.entity';

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @ManyToOne(() => Organization, { nullable: true })
  organization: Rel<Organization> | null = null;

  @OneToMany(() => MemberAccount, (account) => account.member)
  accounts = new Collection<MemberAccount>(this);
  ```

---

## 4. 스키마 바인딩과 조회 API

- **공통 조회 API**:
  - 엔티티 조회와 변경은 `CoreEntity`가 제공하는 static API(`findOne`, `findByPage`, `create`, `nativeUpdate` 등)를 우선 사용함
  - 공통 동작은 `CoreRepository`와 `QueryEngine`에서 관리함
  - 도메인별 복합 조회는 handler 또는 명확한 도메인 query helper에 배치함
- **스키마 바인딩**:
  - `@Entity({ schema: '...' })` 형태로 엔티티가 소속된 데이터베이스 스키마(예: `platform`, `organization` 등)만 명시적으로 설정함
- **예시 코드**:

  ```typescript
  @Entity({ schema: 'platform' })
  export class Member extends CoreEntity<Member> {
    [EntityName]?: 'Member';
  }
  ```

---

## 5. Platform Service DTO와 엔티티 간 타입 동기화

- **적용 목적**: 데이터베이스 엔티티와 타입 정합성을 유지하면서 중복 선언 최소화 및 API 프레젠테이션 계층의 데코레이터와 엔티티 간 관심사 분리
- **DTO 규칙**:
  - 요청 DTO는 `EntityRequestType(Entity)`를 확장하여 엔티티 필드를 선택 입력 계약으로 파생함
  - 응답 DTO는 `EntityResponseType(Entity)`를 확장하여 엔티티 응답 구조를 파생함
  - 피처가 노출하는 필드는 `override`와 `@ApiProperty` / `@ApiPropertyOptional`, class-validator를 명시함
  - nullable scalar와 relation은 엔티티의 `null` 의미를 API 계약까지 전달함
- **요청 DTO 예시**:

  ```typescript
  import { ApiProperty } from '@nestjs/swagger';
  import { MemberInvite } from '@pkg/database';
  import { IsEmail, IsString } from 'class-validator';

  import { EntityRequestType } from '@/common/interfaces';

  export class CreateInviteRequestDto extends EntityRequestType(MemberInvite) {
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

  import { EntityResponseType } from '@/common/interfaces';

  export class MemberResponseDto extends EntityResponseType(Member) {
    @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '멤버 식별자' })
    override id!: string;

    @ApiProperty({ example: '김개발', description: '이름' })
    override name!: string;

    @ApiProperty({ enum: MemberStatus, example: 'ACTIVE', description: '상태' })
    override status!: MemberStatus;

    @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '생성 일시' })
    override createdAt!: Date;
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
