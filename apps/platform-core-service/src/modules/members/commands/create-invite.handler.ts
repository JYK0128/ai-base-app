import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberInvite, MemberInviteMetadata, Organization, OrganizationRole } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { InviteIdRecord } from '../members.contract';
import { CreateInviteCommand } from './create-invite.command';
import { CreateInviteAsserter } from './create-invite.error';

@CommandHandler(CreateInviteCommand)
export class CreateInviteHandler implements ICommandHandler<CreateInviteCommand> {
  private readonly Asserter = CreateInviteAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute({ payload }: CreateInviteCommand): Promise<InviteIdRecord> {
    const { name, email, roleId, note } = payload;
    const organization = await this.identifyOrganization();
    const role = await this.identifyRole(roleId);
    const invite = await this.processCreation(
      organization,
      role,
      name,
      email,
      note,
    );

    return { id: invite.id };
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
  }

  private async identifyRole(roleId: string): Promise<OrganizationRole> {
    return OrganizationRole.getReference(roleId);
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

    const invite = MemberInvite.create({
      name,
      email,
      role,
      organization,
      token: randomUUID(),
      metadata,
    });

    return invite;
  }
}
