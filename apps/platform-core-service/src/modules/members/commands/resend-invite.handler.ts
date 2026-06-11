import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, MemberInviteStatus, Organization } from '@pkg/database';
import { JsonbSetQueryBuilder } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import type { InviteIdRecord } from '../members.contract';
import { ResendInviteCommand } from './resend-invite.command';
import { ResendInviteAsserter } from './resend-invite.error';

@CommandHandler(ResendInviteCommand)
export class ResendInviteHandler implements ICommandHandler<ResendInviteCommand> {
  private readonly Asserter = ResendInviteAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute({ payload }: ResendInviteCommand): Promise<InviteIdRecord> {
    const organization = await this.identifyOrganization();
    const invite = await this.identifyInvite(payload.id);

    await this.processResend(invite, organization);

    return { id: invite.id };
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
  }

  private async identifyInvite(inviteId: string): Promise<MemberInvite> {
    return MemberInvite.getReference(inviteId);
  }

  private async processResend(
    invite: MemberInvite,
    organization: Organization,
  ): Promise<void> {
    const qb = this.em.createQueryBuilder(MemberInvite);
    const now = new Date();
    const builder = new JsonbSetQueryBuilder<MemberInvite>();

    const result = await qb.update({
      status: MemberInviteStatus.QUEUED,
      token: randomUUID(),
      metadata: builder.build('metadata', {
        attemptId: randomUUID(),
        queuedAt: now,
        sentAt: null,
        failedAt: null,
        cancelAt: null,
        acceptedAt: null,
        rejectedAt: null,
      }),
    })
      .where({
        id: invite.id,
        organization: organization.id,
        status: { $in: [MemberInviteStatus.QUEUED, MemberInviteStatus.CANCELED] },
      })
      .execute();

    if (!result.affectedRows) {
      await this.Asserter.throw('INVITE_NOT_FOUND');
    }
  }
}
