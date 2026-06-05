import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, Member, MemberRepository, MemberStatus as DbMemberStatus, Organization, OrganizationRepository, OrganizationRoleAssignment, OrganizationRoleAssignmentRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { MemberMutationResult } from '../members.types';
import { ToggleMemberStatusCommand } from './toggle-member-status.command';
import { ToggleMemberStatusAsserter } from './toggle-member-status.error';

@CommandHandler(ToggleMemberStatusCommand)
export class ToggleMemberStatusHandler implements ICommandHandler<ToggleMemberStatusCommand> {
  private readonly Asserter = ToggleMemberStatusAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(Member)
    private readonly memberRepo: MemberRepository,
    @InjectRepository(OrganizationRoleAssignment)
    private readonly organizationRoleAssignmentRepo: OrganizationRoleAssignmentRepository,
    private readonly em: EntityManager,
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: ToggleMemberStatusCommand): Promise<MemberMutationResult> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, command.id);
    const requestedById = await this.identifyRequestUserId();
    await this.validateSelfMutation(member, requestedById);
    await this.validateLastOwner(member, organization);
    this.processStatusToggle(member);

    return {
      id: member.id,
    };
  }

  private async validateLastOwner(member: Member, organization: Organization): Promise<void> {
    if (member.status === DbMemberStatus.ACTIVE) {
      const currentRoleAssignment = member.organizationRoles.getItems().find((r) => r.organization.id === organization.id);

      if (currentRoleAssignment?.role.code === 'OWNER') {
        const activeOwnerCount = await this.organizationRoleAssignmentRepo.count({
          organization,
          role: { code: 'OWNER' },
          member: { status: DbMemberStatus.ACTIVE },
        });

        if (activeOwnerCount <= 1) {
          await this.Asserter.throw('LAST_OWNER_STATUS_CANNOT_BE_CHANGED');
        }
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

  private processStatusToggle(member: Member): void {
    const nextStatus = member.status === DbMemberStatus.ACTIVE ? DbMemberStatus.INACTIVE : DbMemberStatus.ACTIVE;
    member.status = nextStatus;

    for (const account of member.accounts.getItems()) {
      account.status = nextStatus === DbMemberStatus.ACTIVE ? AccountStatus.ACTIVE : AccountStatus.INACTIVE;
    }
  }
}
