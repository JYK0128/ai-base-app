import { Transactional } from '@mikro-orm/decorators/legacy';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, MemberInviteStatus, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { InviteIdRecord } from '../members.contract';
import { CancelInviteCommand } from './cancel-invite.command';
import { CancelInviteAsserter } from './cancel-invite.error';

@CommandHandler(CancelInviteCommand)
export class CancelInviteHandler implements ICommandHandler<CancelInviteCommand> {
  private readonly Asserter = CancelInviteAsserter;

  constructor(
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) { }

  @Transactional()
  async execute({ payload }: CancelInviteCommand): Promise<InviteIdRecord> {
    const invite = await this.identifyInvite(payload.id);
    const organization = await this.identifyOrganization();

    await this.processCancellation(invite, organization);

    return {
      id: invite.id,
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

  private async validateInviteState(invite: MemberInvite): Promise<void> {
    if (!invite.isPending) {
      await this.Asserter.throw('INVITE_NOT_CANCELLABLE');
    }
  }

  private async processCancellation(invite: MemberInvite, organization: Organization): Promise<void> {
    const qb = this.em.createQueryBuilder(MemberInvite);
    const result = await qb
      .update({
        status: MemberInviteStatus.CANCELED,
      })
      .where({
        id: invite.id,
        organization: organization.id,
        status: MemberInviteStatus.PENDING,
      })
      .execute();

    if (!result.affectedRows) {
      await this.Asserter.throw('INVITE_NOT_FOUND');
    }
  }
}
