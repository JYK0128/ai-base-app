import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, MemberInviteMetadata, Organization, OrganizationRole } from '@pkg/database';
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
  async execute({ data }: CreateInviteContract): Promise<CreateInviteResponseDto> {
    const organization = await this.identifyOrganization();
    const inviter = await this.identifyInviter();
    const role = await this.identifyRole(data.roleId);
    const invite = await this.processCreation(organization, role, data.name, data.email, data.note);

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

  private async identifyInviter(): Promise<Member> {
    const memberId = this.cls.get('memberId');

    if (!memberId) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Member.findOne({ id: memberId }),
      'INVITER_NOT_FOUND',
    );
  }

  private async identifyRole(roleId: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      OrganizationRole.findOne({ id: roleId }),
      'ROLE_NOT_FOUND',
    );
  }

  private async processCreation(
    organization: Organization,
    role: OrganizationRole,
    name: string,
    email: string,
    note?: string,
  ): Promise<MemberInvite> {
    const metadata = new MemberInviteMetadata();
    metadata.note = note;

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
