import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, MemberInviteStatus, Organization } from '@pkg/database';
import { JsonbSetQueryBuilder } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import type { InviteIdRecord } from '../members.contract';
import { ReviveInviteCommand } from './revive-invite.command';
import { ReviveInviteAsserter } from './revive-invite.error';

@CommandHandler(ReviveInviteCommand)
export class ReviveInviteHandler implements ICommandHandler<ReviveInviteCommand> {
  private readonly Asserter = ReviveInviteAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute({ payload }: ReviveInviteCommand): Promise<InviteIdRecord> {
    const organization = await this.identifyOrganization();
    const invite = await this.identifyInvite(payload.id);
    await this.processRevive(invite, organization);

    return {
      id: payload.id,
    };
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

  private async processRevive(
    invite: MemberInvite,
    organization: Organization,
  ): Promise<void> {
    const now = new Date();
    const builder = new JsonbSetQueryBuilder<MemberInvite>();

    const qb = this.em.createQueryBuilder(MemberInvite);
    const result = await qb
      .update({
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
        status: MemberInviteStatus.CANCELED,
      })
      .execute();

    if (!result.affectedRows) {
      await this.Asserter.throw('INVITE_NOT_FOUND');
    }
  }
}
