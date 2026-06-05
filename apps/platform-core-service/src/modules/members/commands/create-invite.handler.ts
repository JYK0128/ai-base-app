import { randomUUID } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount,
         MemberAccountRepository,
         MemberInvite,
         MemberInviteRepository,
         Organization,
         OrganizationRepository,
         OrganizationRole,
         OrganizationRoleRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { resolveMemberRoleCode } from '../members.mapper';
import type { MemberMutationResult } from '../members.types';
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
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: CreateInviteCommand): Promise<MemberMutationResult> {
    const organization = await this.identifyOrganization();
    const inviter = await this.identifyInviter();
    const role = await this.identifyRole(organization, command.role);

    return await this.processCreation(organization, inviter, role, command);
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
    const requestedById = this.cls.get('memberId');

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

  private async identifyRole(organization: Organization, role: CreateInviteCommand['role']): Promise<OrganizationRole> {
    const roleCode = resolveMemberRoleCode(role);

    return await this.Asserter.assert(
      this.roleRepo.findOne({ organization, code: roleCode }),
      'ROLE_NOT_FOUND',
    );
  }

  private async processCreation(
    organization: Organization,
    inviter: MemberAccount,
    role: OrganizationRole,
    command: CreateInviteCommand,
  ): Promise<MemberMutationResult> {
    const now = new Date();
    const normalizedEmail = command.email.trim().toLowerCase();
    const normalizedName = command.name.trim();
    const note = command.note?.trim();

    await this.Asserter.throwIf(normalizedEmail.length === 0, 'INVITE_EMAIL_REQUIRED');
    await this.Asserter.throwIf(normalizedName.length === 0, 'INVITE_NAME_REQUIRED');

    const invite = this.inviteRepo.create({
      name: normalizedName,
      email: normalizedEmail,
      role,
      organization,
      token: randomUUID(),
      invitedBy: inviter.member,
      invitedAt: now,
      expiresAt: new Date(now.getTime() + INVITE_TTL_MS),
      metadata: {
        note,
      },
    });

    this.em.persist(invite);

    return {
      id: invite.id,
    };
  }
}
