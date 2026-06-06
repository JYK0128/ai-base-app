import { randomUUID } from 'node:crypto';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Logger } from '@nestjs/common';
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

import { MailProducerService } from '../../mail/mail-producer.service';
import { resolveMemberRoleCode } from '../members.mapper';
import type { MemberMutationResult, MemberRole } from '../members.types';
import { CreateInviteCommand } from './create-invite.command';
import { CreateInviteAsserter } from './create-invite.error';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@CommandHandler(CreateInviteCommand)
export class CreateInviteHandler implements ICommandHandler<CreateInviteCommand> {
  private readonly Asserter = CreateInviteAsserter;
  private readonly logger = new Logger(CreateInviteHandler.name);

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
    private readonly mailProducer: MailProducerService,
  ) {}

  async execute(command: CreateInviteCommand): Promise<MemberMutationResult> {
    const { name, email, role, note } = command.payload;
    const organization = await this.identifyOrganization();
    const inviter = await this.identifyInviter();
    const roleEntity = await this.identifyRole(organization, role);
    const invite = await this.em.transactional(async (em) => this.processCreation(
      em,
      organization,
      inviter,
      roleEntity,
      name,
      email,
      note,
    ));
    const attemptId = invite.metadata.mailDelivery?.attemptId;

    if (!attemptId) {
      throw new Error('MAIL_DELIVERY_ATTEMPT_ID_NOT_FOUND');
    }

    try {
      await this.mailProducer.sendInviteEmail({
        inviteId: invite.id,
        attemptId,
        email: invite.email,
        organizationName: organization.name,
        inviterName: inviter.member.name,
        token: invite.token,
      });
    }
    catch (error) {
      this.logger.warn(`Failed to publish invite email event for invite ${invite.id} attempt ${attemptId}: ${error instanceof Error ? error.message : String(error)}`);
    }

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
    em: EntityManager,
    organization: Organization,
    inviter: MemberAccount,
    role: OrganizationRole,
    name: string,
    email: string,
    note?: string,
  ): Promise<MemberInvite> {
    const now = new Date();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const trimmedNote = note?.trim();

    await this.Asserter.throwIf(normalizedEmail.length === 0, 'INVITE_EMAIL_REQUIRED');
    await this.Asserter.throwIf(normalizedName.length === 0, 'INVITE_NAME_REQUIRED');

    const metadata = new MemberInviteMetadata();
    metadata.info.note = trimmedNote;

    const invite = this.inviteRepo.create({
      name: normalizedName,
      email: normalizedEmail,
      role,
      organization,
      token: randomUUID(),
      expiresAt: new Date(now.getTime() + INVITE_TTL_MS),
      metadata,
    });

    invite.metadata.mailDelivery = new MemberInviteMailDeliveryMetadata({ queuedAt: now });
    em.persist(invite);

    return invite;
  }
}
