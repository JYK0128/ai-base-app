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

    @Property({ type: Date })
    publishedAt!: Date;
  }

  @Entity({ schema: 'platform' })
  export class Announcement extends CoreEntity<Announcement> {
    [EntityName]?: 'Announcement';

    @Embedded({ entity: () => AnnouncementMetadata, object: true, nullable: true })
    override metadata: Opt<AnnouncementMetadata> = new AnnouncementMetadata();
  }
  ```

---

## 2. Getter / Setter 및 Policy 분리 규칙

- **비즈니스 상태 분리**:
  - 비즈니스 연산, 동적 계산 또는 상태(Status) 판별 로직은 엔티티 내부 getter에 직접 코딩하지 않고, `[domain]-[name].policy-status.ts` 등 **순수 함수 형태의 정책 파일로 분리**하여 개발함
- **readonly getter 노출**:
  - 분리된 정책 함수를 Aggregate Root 엔티티에서 readonly getter로 호출하여 외부 인터페이스에 일관되게 노출함
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
  - Nullable 관계: `@ManyToOne(() => Entity, { nullable: true })` 및 `field?: Rel<T>` 구문 사용
  - One-to-Many 관계: `new Collection<T>(this)` 구문을 사용하여 항상 기본 인스턴스를 즉각 생성 및 할당함
- **예시 코드**:

  ```typescript
  import { Organization } from '../organization/organization.entity';
  import { MemberAccount } from './member-account.entity';

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @ManyToOne(() => Organization, { nullable: true })
  organization?: Rel<Organization>;

  @OneToMany(() => MemberAccount, (account) => account.member)
  accounts = new Collection<MemberAccount>(this);
  ```

---

## 4. 스키마 바인딩 규칙 (Repository 미사용)

- **리포지토리 파일 제거**:
  - 개편된 스키마 설계에 따라 개별 엔티티별 리포지토리 파일(`*.repository.ts`)은 기본적으로 **생성하지 않음**
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
