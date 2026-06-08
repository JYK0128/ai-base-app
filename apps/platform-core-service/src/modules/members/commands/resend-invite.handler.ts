import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount, MemberInvite, MemberInviteMailDeliveryMetadata, MemberInviteMetadata, MemberInviteStatus, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { InviteOutputResult } from '../members.types';
import { ResendInviteCommand } from './resend-invite.command';
import { ResendInviteAsserter } from './resend-invite.error';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@CommandHandler(ResendInviteCommand)
export class ResendInviteHandler implements ICommandHandler<ResendInviteCommand> {
  private readonly Asserter = ResendInviteAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute({ payload }: ResendInviteCommand): Promise<InviteOutputResult> {
    const organization = await this.identifyOrganization();
    const invite = await this.identifyInvite(organization, payload.id);
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
      Organization.findOne({ id: organizationId }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async identifyInvite(organization: Organization, id: string): Promise<MemberInvite> {
    return await this.Asserter.assert(
      MemberInvite.findOne({ id, organization }),
      'INVITE_NOT_FOUND',
    );
  }

  private async identifyInviter(): Promise<MemberAccount> {
    const requestedById = this.cls.get('accountId');

    if (!requestedById) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return await this.Asserter.assert(
      MemberAccount.findOne(
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

