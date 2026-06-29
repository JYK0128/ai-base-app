import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, MemberInviteMetadata, Organization, OrganizationRole } from '@pkg/database';
import type { AuthMemberContext, AuthOrganizationContext } from '@pkg/shared/server';
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
  async execute(command: CreateInviteContract): Promise<CreateInviteResponseDto> {
    const organization = await this.identifyOrganization();
    const inviter = await this.identifyInviter();
    const role = await this.identifyRole(command.data.role);

    await this.verifyPolicies(organization, command.data.email);

    const invite = await this.processCreation(command, organization, role);

    this.inviteEmailPublisher.publishInviteEmail({
      inviteId: invite.id,
      attemptId: invite.metadata?.attemptId ?? '',
      email: invite.email,
      organizationName: organization.name,
      inviterName: inviter.name,
      token: invite.token,
    });

    return new CreateInviteResponseDto(invite.id);
  }

  private async verifyPolicies(_organization: Organization, _email: string): Promise<void> {
    // 중복 초대 여부, 조직 정원 초과 등 도메인 검증 영역
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Organization.findOne({ id: organization.id }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async identifyInviter(): Promise<Member> {
    const member = this.cls.get<AuthMemberContext>('member');

    if (!member) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Member.findOne({ id: member.id }),
      'INVITER_NOT_FOUND',
    );
  }

  private async identifyRole(role: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      OrganizationRole.findOne({ id: role }),
      'ROLE_NOT_FOUND',
    );
  }

  private async processCreation(
    command: CreateInviteContract,
    organization: Organization,
    role: OrganizationRole,
  ): Promise<MemberInvite> {
    const { name, email, note } = command.data;
    const metadata = new MemberInviteMetadata();
    if (note !== undefined) {
      metadata.note = note;
    }

    return MemberInvite.create({
      name,
      email,
      role,
      organization,
      token: randomUUID(),
      metadata,
    });
  }
}
