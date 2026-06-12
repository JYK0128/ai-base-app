# CQRS 핵심 구성 요소 구현 가이드

본 문서는 프로젝트 내부의 실제 구현 코드 스타일을 준수하여 메시지 계약, DTO, 에러 어서터, 핸들러, 그리고 이벤트 발행기를 작성하기 위한 구체적인 가이드와 코드 템플릿을 제공합니다.

---

## 📄 1. 메시지 계약 (Contract)

모든 Command와 Query는 NestJS CQRS 패키지의 `Command` 및 `Query` 클래스를 상속하며, 반환 타입을 제네릭 매개변수로 명시합니다.

* 생성자 파라미터는 `public readonly data: RequestDto` 형태로 통일하여 유스케이스 입력 데이터를 캡슐화합니다.
* `super()` 호출을 누락하지 않도록 주의합니다.

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

예외 처리는 `@pkg/shared/server`에서 제공하는 `defineErrors`와 `ExceptionGuard`를 조합하여 구성합니다.

* 에러 메시지는 한국어(`ko`)와 영어(`en`) 다국어를 모두 포함하는 구조로 선언합니다.
* 각 에러 유형별로 적절한 HTTP Exception 클래스(예: `NotFoundException`, `UnauthorizedException` 등 `@nestjs/common`)를 매핑합니다.
* `ExceptionGuard.setMessages`를 통해 인스턴스화된 `Asserter`를 핸들러에서 에러 처리 및 데이터 검증에 활용합니다.

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

Command 핸들러는 데이터를 변경하는 역할을 하므로 데이터 일관성을 지키기 위해 **트랜잭션**이 강제됩니다.

* `@CommandHandler(Contract)` 데코레이터를 클래스에 적용하고 `ICommandHandler<Contract>` 인터페이스를 구현합니다.
* `execute` 메서드 상단에 `@Transactional()` 데코레이터(가져올 곳: `@mikro-orm/decorators/legacy`)를 작성하여 트랜잭션 경계를 선언합니다.
* `ClsService`를 통해 요청 스레드 컨텍스트(예: `organizationId`, `memberId`)를 안전하게 조회합니다.
* `this.Asserter.assert` 메서드를 사용해 비동기 데이터베이스 조회를 즉시 검증(Fail-Fast)합니다.
* 비즈니스 핵심 로직은 가독성 증대를 위해 private 메서드로 분할하여 선형적으로 구성합니다.

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

Query 핸들러는 데이터를 단순 조회하는 역할로, 트랜잭션 오버헤드를 줄이기 위해 `@Transactional()` 데코레이터를 적용하지 않습니다.

* `@QueryHandler(Contract)` 데코레이터를 클래스에 적용하고 `IQueryHandler<Contract>` 인터페이스를 구현합니다.
* MikroORM을 통한 데이터 조회 시 관계 엔티티 로딩이 필요하다면 `populate` 옵션을 적극 활용합니다.
* ID만 알면 되는 연관 참조는 데이터베이스 라운드 트립을 피하기 위해 `Organization.getReference(id)`와 같은 레퍼런스 조회 패턴을 사용합니다.

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

네트워크 I/O가 동반되는 비동기 작업은 RabbitMQ 마이크로서비스용 `ClientProxy`를 주입받아 처리합니다.

* 메시지 큐에 브로드캐스팅할 때 동기적 대기를 유발하는 `send`가 아닌 비차단(Non-blocking) 형태의 `emit` 메서드를 호출합니다.
* 정상 발행 여부를 모니터링하기 위해 `subscribe` 메서드를 체이닝하고 에러 발생 시 적절하게 로깅합니다.

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
