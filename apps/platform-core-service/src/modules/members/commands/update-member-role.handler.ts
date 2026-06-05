import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Member, MemberRepository, MemberStatus, Organization, OrganizationRepository, OrganizationRole, OrganizationRoleAssignment, OrganizationRoleAssignmentRepository, OrganizationRoleRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { resolveMemberRoleCode } from '../members.mapper';
import type { MemberMutationResult } from '../members.types';
import { UpdateMemberRoleCommand } from './update-member-role.command';
import { UpdateMemberRoleAsserter } from './update-member-role.error';

@CommandHandler(UpdateMemberRoleCommand)
export class UpdateMemberRoleHandler implements ICommandHandler<UpdateMemberRoleCommand> {
  private readonly Asserter = UpdateMemberRoleAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(Member)
    private readonly memberRepo: MemberRepository,
    @InjectRepository(OrganizationRoleAssignment)
    private readonly organizationRoleAssignmentRepo: OrganizationRoleAssignmentRepository,
    @InjectRepository(OrganizationRole)
    private readonly roleRepo: OrganizationRoleRepository,
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: UpdateMemberRoleCommand): Promise<MemberMutationResult> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, command.id);
    const requestedById = await this.identifyRequestUserId();
    await this.validateSelfMutation(member, requestedById);
    const role = await this.identifyRole(organization, command.role);
    await this.validateLastOwner(member, organization, role);
    await this.processRoleUpdate(member, organization, role);

    return {
      id: member.id,
    };
  }

  private async validateLastOwner(member: Member, organization: Organization, targetRole: OrganizationRole): Promise<void> {
    const currentRoleAssignment = member.organizationRoles.getItems().find((r) => r.organization.id === organization.id);

    if (currentRoleAssignment?.role.code === 'OWNER' && targetRole.code !== 'OWNER') {
      const activeOwnerCount = await this.organizationRoleAssignmentRepo.count({
        organization,
        role: { code: 'OWNER' },
        member: { status: MemberStatus.ACTIVE },
      });

      if (activeOwnerCount <= 1) {
        await this.Asserter.throw('LAST_OWNER_ROLE_CANNOT_BE_CHANGED');
      }
    }
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

  private async identifyRequestUserId(): Promise<string> {
    const requestedById = this.cls.get('memberId');

    if (!requestedById) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return requestedById;
  }

  private async identifyMember(organization: Organization, id: string): Promise<Member> {
    return await this.Asserter.assert(
      this.memberRepo.findOne(
        { id, organization },
        {
          populate: ['accounts', 'organizationRoles.role', 'organizationRoles.organization'],
        },
      ),
      'MEMBER_NOT_FOUND',
    );
  }

  private async validateSelfMutation(member: Member, requestedById: string): Promise<void> {
    const isSelf = member.accounts.getItems().some((account) => account.id === requestedById);
    if (isSelf) {
      await this.Asserter.throw('CANNOT_MODIFY_SELF');
    }
  }

  private async identifyRole(organization: Organization, role: UpdateMemberRoleCommand['role']): Promise<OrganizationRole> {
    const roleCode = resolveMemberRoleCode(role);

    return await this.Asserter.assert(
      this.roleRepo.findOne({ organization, code: roleCode }),
      'ROLE_NOT_FOUND',
    );
  }

  private async processRoleUpdate(member: Member, organization: Organization, role: OrganizationRole): Promise<void> {
    const existing = member.organizationRoles.getItems().find((organizationRole) => organizationRole.organization.id === organization.id);

    if (existing) {
      existing.role = role;
    }
    else {
      const organizationRole = this.organizationRoleAssignmentRepo.create({
        member: member,
        role,
        organization,
      });
      this.em.persist(organizationRole);
    }
  }
}
