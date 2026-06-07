import { randomUUID } from 'node:crypto';

import { InjectRepository } from '@mikro-orm/nestjs';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount,
         MemberAccountRepository,
         MemberInvite,
         MemberInviteMailDeliveryMetadata,
         MemberInviteMetadata,
         MemberInviteRepository,
         Organization,
         OrganizationRepository,
         OrganizationRole,
         OrganizationRoleRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { resolveMemberRoleCode } from '../members.mapper';
import type { InviteMutationResult, MemberRole } from '../members.types';
import { CreateInviteCommand } from './create-invite.command';
import { CreateInviteAsserter } from './create-invite.error';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@CommandHandler(CreateInviteCommand)
export class CreateInviteHandler implements ICommandHandler<CreateInviteCommand> {
  private readonly Asserter = CreateInviteAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepo: MemberAccountRepository,
    @InjectRepository(MemberInvite)
    private readonly inviteRepo: MemberInviteRepository,
    @InjectRepository(OrganizationRole)
    private readonly roleRepo: OrganizationRoleRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(command: CreateInviteCommand): Promise<InviteMutationResult> {
    const { name, email, role, note } = command.payload;
    const organization = await this.identifyOrganization();
    const inviter = await this.identifyInviter();
    const roleEntity = await this.identifyRole(organization, role);
    const invite = await this.processCreation(
      organization,
      roleEntity,
      name,
      email,
      note,
    );
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

  private async identifyInviter(): Promise<MemberAccount> {
    const requestedById = this.cls.get('accountId');

    if (!requestedById) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return await this.Asserter.assert(
      this.memberAccountRepo.findOne(
        { id: requestedById },
        {
          populate: ['member'],
        },
      ),
      'INVITER_NOT_FOUND',
    );
  }

  private async identifyRole(organization: Organization, role: MemberRole): Promise<OrganizationRole> {
    const roleCode = resolveMemberRoleCode(role);

    return await this.Asserter.assert(
      this.roleRepo.findOne({ organization, code: roleCode }),
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
    const now = new Date();

    const metadata = new MemberInviteMetadata();
    metadata.info.note = note;

    const invite = this.inviteRepo.create({
      name,
      email,
      role,
      organization,
      token: randomUUID(),
      expiresAt: new Date(now.getTime() + INVITE_TTL_MS),
      metadata,
    });

    invite.metadata.mailDelivery = new MemberInviteMailDeliveryMetadata({ queuedAt: now });
    return invite;
  }
}
