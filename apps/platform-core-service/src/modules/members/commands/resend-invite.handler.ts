import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, MemberInviteRepository, MemberInviteStatus, Organization, OrganizationRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { MemberMutationResult } from '../members.types';
import { ResendInviteCommand } from './resend-invite.command';
import { ResendInviteAsserter } from './resend-invite.error';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@CommandHandler(ResendInviteCommand)
export class ResendInviteHandler implements ICommandHandler<ResendInviteCommand> {
  private readonly Asserter = ResendInviteAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(MemberInvite)
    private readonly inviteRepo: MemberInviteRepository,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: ResendInviteCommand): Promise<MemberMutationResult> {
    const organization = await this.identifyOrganization();
    const invite = await this.identifyInvite(organization, command.id);
    await this.validateInviteState(invite);
    this.processResend(invite);

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
      await this.Asserter.throw('INVITE_NOT_RESENDABLE');
    }
  }

  private processResend(invite: MemberInvite): void {
    const now = new Date();
    const invitedAt = now.toISOString();

    invite.status = MemberInviteStatus.PENDING;
    invite.token = randomUUID();
    invite.invitedAt = now;
    invite.expiresAt = new Date(now.getTime() + INVITE_TTL_MS);
    invite.metadata = {
      ...invite.metadata,
      resentAt: invitedAt,
    };
  }
}
