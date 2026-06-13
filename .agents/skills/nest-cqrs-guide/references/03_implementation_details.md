# CQRS 핵심 구성 요소 구현 가이드

메시지 계약, DTO, 에러 어서터, 핸들러, 이벤트 발행기를 작성하기 위한 구체적인 구현 패턴 및 코드 템플릿 제공.

---

## 📄 1. 메시지 계약 (Contract)

모든 Command와 Query는 NestJS CQRS 패키지의 `Command` 및 `Query` 클래스를 상속하며 반환 타입을 제네릭 매개변수로 명시함.

* 생성자 파라미터는 `public readonly data: RequestDto` 형태로 통일하여 입력 데이터를 캡슐화함.
* 부모 클래스 생성자 호출인 `super()`를 누락 없이 작성함.

### 💻 구현 예시

```typescript
// domains/members/create-invite/create-invite.contract.ts
import { Command } from '@nestjs/cqrs';
import type { CreateInviteRequestDto } from './create-invite.request.dto';
import type { CreateInviteResponseDto } from './create-invite.response.dto';

export class CreateInviteContract extends Command<CreateInviteResponseDto> {
  constructor(public readonly data: CreateInviteRequestDto) {
    super();
  }
}
```

---

## 🚨 2. 에러 정의 및 어서터 (Error & Asserter)

예외 처리는 `@pkg/shared/server`에서 제공하는 `defineErrors`와 `ExceptionGuard`를 조합하여 정의함.

* 에러 메시지는 한국어(`ko`)와 영어(`en`) 다국어를 모두 포함하는 구조로 선언함.
* 각 에러 유형별로 적절한 HTTP Exception 클래스(예: `NotFoundException`, `UnauthorizedException` 등)를 매핑함.
* `ExceptionGuard.setMessages`를 통해 인스턴스화된 `Asserter`를 생성하고 핸들러 내 데이터 검증에 활용함.

### 💻 구현 예시

```typescript
// domains/members/create-invite/create-invite.error.ts
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { defineErrors, ExceptionGuard } from '@pkg/shared/server';

const ERROR_MESSAGES = defineErrors({
  ORGANIZATION_NOT_FOUND: {
    message: {
      ko: '조직을 찾을 수 없습니다.',
      en: 'Organization not found.',
    },
    exception: NotFoundException,
  },
  INVITER_NOT_FOUND: {
    message: {
      ko: '초대를 생성한 사용자를 찾을 수 없습니다.',
      en: 'Inviter not found.',
    },
    exception: NotFoundException,
  },
  REQUEST_CONTEXT_NOT_FOUND: {
    message: {
      ko: '요청 사용자 정보를 찾을 수 없습니다.',
      en: 'Request user context not found.',
    },
    exception: UnauthorizedException,
  },
});

export const CreateInviteAsserter = ExceptionGuard.setMessages(ERROR_MESSAGES);
```

---

## 🔄 3. Command 핸들러 구현 패턴

Command 핸들러는 데이터를 변경하는 역할로 데이터 일관성을 지키기 위해 **트랜잭션**을 필수로 지정함.

* `@CommandHandler(Contract)` 데코레이터를 클래스에 적용하고 `ICommandHandler<Contract>` 인터페이스를 구현함.
* `execute` 메서드 상단에 `@Transactional()` 데코레이터(가져올 곳: `@mikro-orm/decorators/legacy`)를 작성하여 트랜잭션 경계를 설정함.
* `execute` 메서드 내부의 로직 흐름은 반드시 **선형적인 3단계 흐름(3-Phase Flow)**에 따라 구현하여 핵심 비즈니스 로직을 가시화함:
  1. **Identification (식별)**: `ClsService` 컨텍스트 정보 및 리포지토리를 통해 주 엔티티를 조회함 (가드성 널 체크 및 미존재 예외 처리는 이 단계 내부 메서드에 캡슐화).
  2. **Verification (검증)**: 식별된 엔티티를 활용하여 비즈니스 규칙 및 도메인 정책을 검증함 (예: `validatePolicies()`).
  3. **Process (처리)**: 검증 완료 후 엔티티 상태를 변경하거나 도메인 비즈니스 액션을 실행함 (예: `processUpdate()`).
* `ClsService`를 통해 요청 스레드 컨텍스트(예: `organizationId`, `memberId`)를 안전하게 획득함.
* `this.Asserter.assert` 메서드를 사용하여 데이터베이스 조회 및 비즈니스 검증을 즉시 수행함(Fail-Fast).
* 비즈니스 핵심 로직은 가독성 증대를 위해 private 메서드로 분할하여 선형적으로 구성함.

### 💻 구현 예시

```typescript
// domains/members/create-invite/create-invite.handler.ts
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from '@mikro-orm/decorators/legacy';
import { Member, MemberInvite, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { CreateInviteContract } from './create-invite.contract';
import { CreateInviteAsserter } from './create-invite.error';
import { CreateInviteResponseDto } from './create-invite.response.dto';
import { InviteEmailPublisher } from './invite-email.publisher';

@CommandHandler(CreateInviteContract)
export class CreateInviteHandler implements ICommandHandler<CreateInviteContract> {
  private readonly Asserter = CreateInviteAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly inviteEmailPublisher: InviteEmailPublisher,
  ) {}

  @Transactional()
  async execute({ data }: CreateInviteContract): Promise<CreateInviteResponseDto> {
    // 1. 컨텍스트 및 의존성 데이터 식별 (Fail-Fast)
    const organization = await this.identifyOrganization();
    const inviter = await this.identifyInviter();

    // 2. 핵심 비즈니스 처리
    const invite = await this.processCreation(organization, data.name, data.email);

    // 3. 비동기 사이드 이펙트 트리거
    this.inviteEmailPublisher.publishInviteEmail({
      inviteId: invite.id,
      email: invite.email,
      organizationName: organization.name,
      inviterName: inviter.name,
    });

    return new CreateInviteResponseDto(invite.id);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');
    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Organization.findOne({ id: organizationId }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async identifyInviter(): Promise<Member> {
    const memberId = this.cls.get('memberId');
    if (!memberId) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Member.findOne({ id: memberId }),
      'INVITER_NOT_FOUND',
    );
  }

  private async processCreation(organization: Organization, name: string, email: string): Promise<MemberInvite> {
    return MemberInvite.create({
      name,
      email,
      organization,
    });
  }
}
```

---

## 🔍 4. Query 핸들러 구현 패턴

Query 핸들러는 데이터를 단순 조회하는 역할로 트랜잭션 오버헤드를 배제하기 위해 `@Transactional()` 데코레이터를 적용하지 않음.

* `@QueryHandler(Contract)` 데코레이터를 클래스에 적용하고 `IQueryHandler<Contract>` 인터페이스를 구현함.
* 관계 엔티티 로딩이 필요하다면 `populate` 옵션을 적극 지정함.
* 연관 참조의 ID 식별 용도로는 데이터베이스 조회 비용이 없는 `Organization.getReference(id)`와 같은 레퍼런스 조회 패턴을 사용함.

### 💻 구현 예시

```typescript
// domains/members/get-member/get-member.handler.ts
import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetMemberContract } from './get-member.contract';
import { GetMemberAsserter } from './get-member.error';
import { MemberResponseDto } from './get-member.response.dto';

@QueryHandler(GetMemberContract)
export class GetMemberHandler implements IQueryHandler<GetMemberContract> {
  private readonly Asserter = GetMemberAsserter;

  constructor(private readonly cls: ClsService) {}

  async execute({ data }: GetMemberContract): Promise<MemberResponseDto> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, data.id);

    return new MemberResponseDto(member);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');
    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    // DB 조회 없이 참조 타입만 생성
    return Organization.getReference(organizationId);
  }

  private async identifyMember(organization: Organization, id: string): Promise<Member> {
    return await this.Asserter.assert(
      Member.findOne(
        { id, organization },
        { populate: ['accounts', 'organizationRoles.role'] }
      ),
      'MEMBER_NOT_FOUND',
    );
  }
}
```

---

## ⚡ 5. 비동기 이벤트 발행기 (Publisher)

네트워크 I/O가 동반되는 비동기 작업은 RabbitMQ 마이크로서비스용 `ClientProxy`를 주입받아 처리함.

* 메시지 큐 브로드캐스팅 시 동기 대기를 피하기 위해 `send` 대신 비차단(Non-blocking) 형태의 `emit` 메서드를 호출함.
* 발행 모니터링을 위해 `subscribe` 메서드를 체이닝하고 예외 처리를 로깅함.

### 💻 구현 예시

```typescript
// domains/members/create-invite/invite-email.publisher.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class InviteEmailPublisher {
  private readonly logger = new Logger(InviteEmailPublisher.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  publishInviteEmail(payload: { inviteId: string; email: string; organizationName: string; inviterName: string }): void {
    const pattern = 'mail.invite.send';
    
    this.logger.log(`Publishing ${pattern} event to RabbitMQ for invite ${payload.inviteId}`);
    
    this.client.emit(pattern, payload).subscribe({
      error: (error) => {
        this.logger.error(
          `Failed to publish ${pattern} event for invite ${payload.inviteId}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      },
    });
  }
}
```

---

## 📦 6. 피처별 DTO 독립성 원칙

모든 유스케이스(Feature)는 격리된 API 사양과 독립적인 진화 방향을 유지하기 위해 자신만의 전용 DTO(Data Transfer Object)를 정의함.

* **피처별 전용 DTO 생성**: 예를 들어 `UpdateMemberStatus`와 `UpdateMemberRole`이 둘 다 멤버의 `id`값만 응답(`{ id: string }`)하는 동일 구조를 갖더라도, 각 피처의 디렉토리 하위에 각각 `UpdateMemberStatusResponseDto`, `UpdateMemberRoleResponseDto` 클래스를 독립적으로 생성하여 정의함.
* **영향도 격리**: 특정 피처의 기능 개편으로 인해 API 필드 사양이 달라질 때, DTO가 독립적으로 격리되어 있어야만 타 기능에 영향을 주지 않고 안전하게 변경을 전파할 수 있음.

### 💻 구현 예시 (독립적인 DTO 작성)

```typescript
// domains/members/update-member-status/update-member-status.response.dto.ts
export class UpdateMemberStatusResponseDto {
  constructor(public readonly id: string) {}
}

// domains/members/update-member-role/update-member-role.response.dto.ts
export class UpdateMemberRoleResponseDto {
  constructor(public readonly id: string) {}
}
```
