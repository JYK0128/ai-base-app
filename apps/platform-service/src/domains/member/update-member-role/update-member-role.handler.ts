import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Member, MemberStatus, Organization, OrganizationRole, OrganizationRoleAssignment } from '@pkg/database';
import type { AuthMemberContext, AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { UpdateMemberRoleContract } from './update-member-role.contract';
import { UpdateMemberRoleAsserter } from './update-member-role.error';
import { UpdateMemberRoleResponseDto } from './update-member-role.response.dto';

@CommandHandler(UpdateMemberRoleContract)
export class UpdateMemberRoleHandler implements ICommandHandler<UpdateMemberRoleContract> {
  private readonly Asserter = UpdateMemberRoleAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: UpdateMemberRoleContract): Promise<UpdateMemberRoleResponseDto> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, command.data.id);
    const requestMember = await this.identifyRequestMember();
    const role = command.data.role === undefined
      ? undefined
      : await this.identifyRole(organization, command.data.role);

    await this.verifySelfMutation(member, requestMember);
    await this.processRoleUpdate(member, requestMember, organization, role);

    return new UpdateMemberRoleResponseDto(member.id);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Organization.findOne({ id: organization.id }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async identifyRequestMember(): Promise<Member> {
    const member = this.cls.get<AuthMemberContext>('member');

    if (!member) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return Member.getReference(member.id);
  }

  private async identifyMember(organization: Organization, memberId: string): Promise<Member> {
    return await this.Asserter.assert(
      Member.findOne({ id: memberId, organization }),
      'MEMBER_NOT_FOUND',
    );
  }

  private async identifyRole(organization: Organization, role: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      OrganizationRole.findOne({ id: role, organization }),
      'ROLE_NOT_FOUND',
    );
  }

  private async verifySelfMutation(member: Member, requestMember: Member): Promise<void> {
    if (member.id === requestMember.id) {
      await this.Asserter.throw('CANNOT_MODIFY_SELF');
    }
  }

  private async processRoleUpdate(
    member: Member,
    requestMember: Member,
    organization: Organization,
    role: OrganizationRole | undefined,
  ): Promise<void> {
    if (!role) {
      return;
    }

    const currentAssignment = await this.identifyCurrentAssignment(member, organization);
    if (currentAssignment?.role.code === role.code) {
      return;
    }

    const ownerCount = await OrganizationRoleAssignment.count({
      organization: { id: organization.id },
      role: { code: 'OWNER' },
      member: { status: MemberStatus.ACTIVE },
    });

    if (currentAssignment?.role.code === 'OWNER' && role.code !== 'OWNER' && ownerCount <= 1) {
      await this.Asserter.throw('LAST_OWNER_ROLE_CANNOT_BE_CHANGED');
    }

    const result = await OrganizationRoleAssignment.getQueryBuilder()
      .update({ role })
      .where({
        $and: [
          { member },
          { organization },
          { member: { id: { $ne: requestMember.id } } },
        ],
      })
      .execute();

    if (result.affectedRows === 0) {
      await this.Asserter.throw('LAST_OWNER_ROLE_CANNOT_BE_CHANGED');
    }
  }

  private async identifyCurrentAssignment(
    member: Member,
    organization: Organization,
  ): Promise<OrganizationRoleAssignment | null> {
    return OrganizationRoleAssignment.findOne(
      { member, organization },
      { populate: ['role'] },
    );
  }
}
