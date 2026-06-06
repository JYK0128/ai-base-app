import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, MemberInviteMetadata, MemberInviteRepository, MemberInviteStatus, Organization, OrganizationRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { MemberMutationResult } from '../members.types';
import { CancelInviteCommand } from './cancel-invite.command';
import { CancelInviteAsserter } from './cancel-invite.error';

@CommandHandler(CancelInviteCommand)
export class CancelInviteHandler implements ICommandHandler<CancelInviteCommand> {
  private readonly Asserter = CancelInviteAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(MemberInvite)
    private readonly inviteRepo: MemberInviteRepository,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: CancelInviteCommand): Promise<MemberMutationResult> {
    const organization = await this.identifyOrganization();
    const invite = await this.identifyInvite(organization, command.id);
    await this.validateInviteState(invite);
    this.processCancellation(invite);

    return {
      id: invite.id,
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

  private async validateInviteState(invite: MemberInvite): Promise<void> {
    if (!invite.isPending) {
      await this.Asserter.throw('INVITE_NOT_CANCELLABLE');
    }
  }

  private processCancellation(invite: MemberInvite): void {
    const now = new Date();
    const metadata = new MemberInviteMetadata(invite.metadata);

    invite.status = MemberInviteStatus.CANCELED;
    metadata.timeline.canceledAt = now;
    invite.metadata = metadata;
  }
}
