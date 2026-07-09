import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, MemberInviteMetadata, MemberInviteStatus, Organization } from '@pkg/database';
import type { AuthMemberContext, AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { ENV } from '@/env';

import { InviteEmailPublisher } from '../../mail/invite-email/invite-email.publisher';
import { ResendInviteContract } from './resend-invite.contract';
import { ResendInviteAsserter } from './resend-invite.error';
import { ResendInviteResponseDto } from './resend-invite.response.dto';

@CommandHandler(ResendInviteContract)
export class ResendInviteHandler implements ICommandHandler<ResendInviteContract> {
  private readonly Asserter = ResendInviteAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly inviteEmailPublisher: InviteEmailPublisher,
  ) {}

  @Transactional()
  async execute(command: ResendInviteContract): Promise<ResendInviteResponseDto> {
    const organization = await this.identifyOrganization();
    const inviter = await this.identifyInviter();
    const sourceInvite = await this.identifySourceInvite(command, organization);

    await this.verifyResendable(sourceInvite);

    const invite = await this.process(command, sourceInvite, organization);

    this.inviteEmailPublisher.publishInviteEmail({
      inviteId: invite.id,
      email: invite.email,
      organizationName: organization.name,
      inviterName: inviter.name,
      token: invite.token,
    });

    return new ResendInviteResponseDto(invite.id);
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

  private async identifySourceInvite(command: ResendInviteContract, organization: Organization): Promise<MemberInvite> {
    return await this.Asserter.assert(
      MemberInvite.findOne(
        {
          id: command.data.id,
          organization,
        },
        { populate: ['role'] },
      ),
      'INVITE_NOT_FOUND',
    );
  }

  private async verifyResendable(invite: MemberInvite): Promise<void> {
    const resendableStatuses: MemberInviteStatus[] = [
      MemberInviteStatus.QUEUED,
      MemberInviteStatus.PENDING,
      MemberInviteStatus.EXPIRED,
    ];

    if (!resendableStatuses.includes(invite.status)) {
      await this.Asserter.throw('INVITE_NOT_RESENDABLE');
    }
  }

  private async process(
    _command: ResendInviteContract,
    sourceInvite: MemberInvite,
    organization: Organization,
  ): Promise<MemberInvite> {
    const metadata = new MemberInviteMetadata();
    metadata.expiredAt = new Date(Date.now() + (ENV.MEMBER_INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));

    return MemberInvite.create({
      name: sourceInvite.name,
      email: sourceInvite.email,
      note: sourceInvite.note,
      role: sourceInvite.role,
      organization,
      token: randomUUID(),
      metadata,
    });
  }
}
