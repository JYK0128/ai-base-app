import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, MemberInviteStatus, Organization } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { CancelInviteContract } from './cancel-invite.contract';
import { CancelInviteAsserter } from './cancel-invite.error';
import { CancelInviteResponseDto } from './cancel-invite.response.dto';

@CommandHandler(CancelInviteContract)
export class CancelInviteHandler implements ICommandHandler<CancelInviteContract> {
  private readonly Asserter = CancelInviteAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: CancelInviteContract): Promise<CancelInviteResponseDto> {
    const organization = await this.identifyOrganization();
    const invite = await this.identifyInvite(command, organization);

    await this.verifyCancelable(invite);
    await this.process(command, invite);

    return new CancelInviteResponseDto(invite.id);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organization.id);
  }

  private async identifyInvite(command: CancelInviteContract, organization: Organization): Promise<MemberInvite> {
    return await this.Asserter.assert(
      MemberInvite.findOne({
        id: command.data.id,
        organization,
      }),
      'INVITE_NOT_FOUND',
    );
  }

  private async verifyCancelable(invite: MemberInvite): Promise<void> {
    if (invite.status !== MemberInviteStatus.QUEUED && invite.status !== MemberInviteStatus.PENDING) {
      await this.Asserter.throw('INVITE_ALREADY_FINALIZED');
    }
  }

  private async process(_command: CancelInviteContract, invite: MemberInvite): Promise<void> {
    invite.metadata.cancelAt = new Date();
  }
}
