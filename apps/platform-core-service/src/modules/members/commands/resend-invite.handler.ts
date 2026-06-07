import { randomUUID } from 'node:crypto';

import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount, MemberAccountRepository, MemberInvite, MemberInviteMailDeliveryMetadata, MemberInviteMetadata, MemberInviteRepository, MemberInviteStatus, Organization, OrganizationRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { InviteMutationResult } from '../members.types';
import { ResendInviteCommand } from './resend-invite.command';
import { ResendInviteAsserter } from './resend-invite.error';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@CommandHandler(ResendInviteCommand)
export class ResendInviteHandler implements ICommandHandler<ResendInviteCommand> {
  private readonly Asserter = ResendInviteAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepo: MemberAccountRepository,
    @InjectRepository(MemberInvite)
    private readonly inviteRepo: MemberInviteRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(command: ResendInviteCommand): Promise<InviteMutationResult> {
    const organization = await this.identifyOrganization();
    const invite = await this.identifyInvite(organization, command.payload.id);
    await this.validateInviteState(invite);
    const inviter = await this.identifyInviter();
    this.processResend(invite);
    const attemptId = invite.metadata.mailDelivery?.attemptId;

    if (!attemptId) {
      throw new Error('MAIL_DELIVERY_ATTEMPT_ID_NOT_FOUND');
    }

    return {
      invite,
      organization,
      inviter,
    };
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      this.organizationRepo.findOne({ id: organizationId }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async identifyInvite(organization: Organization, id: string): Promise<MemberInvite> {
    return await this.Asserter.assert(
      this.inviteRepo.findOne({ id, organization }),
      'INVITE_NOT_FOUND',
    );
  }

  private async identifyInviter(): Promise<MemberAccount> {
    const requestedById = this.cls.get('accountId');

    if (!requestedById) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return await this.Asserter.assert(
      this.memberAccountRepo.findOne(
        { id: requestedById },
        { populate: ['member'] },
      ),
      'INVITER_NOT_FOUND',
    );
  }

  private async validateInviteState(invite: MemberInvite): Promise<void> {
    if (!invite.isPending) {
      await this.Asserter.throw('INVITE_NOT_RESENDABLE');
    }
  }

  private processResend(
    invite: MemberInvite,
  ): void {
    const now = new Date();
    const metadata = new MemberInviteMetadata(invite.metadata);

    invite.status = MemberInviteStatus.PENDING;
    invite.token = randomUUID();
    invite.expiresAt = new Date(now.getTime() + INVITE_TTL_MS);
    metadata.timeline.resentAt = now;
    metadata.mailDelivery = new MemberInviteMailDeliveryMetadata({ queuedAt: now });
    invite.metadata = metadata;
  }
}
