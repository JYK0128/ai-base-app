import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Member, MemberStatus, Organization, OrganizationRoleAssignment } from '@pkg/database';
import type { AuthMemberContext, AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { UpdateMemberStatusContract } from './update-member-status.contract';
import { UpdateMemberStatusAsserter } from './update-member-status.error';
import { UpdateMemberStatusResponseDto } from './update-member-status.response.dto';

@CommandHandler(UpdateMemberStatusContract)
export class UpdateMemberStatusHandler implements ICommandHandler<UpdateMemberStatusContract> {
  private readonly Asserter = UpdateMemberStatusAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: UpdateMemberStatusContract): Promise<UpdateMemberStatusResponseDto> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, command.data.id);
    const requestMember = await this.identifyRequestMember();

    await this.verifySelfMutation(member, requestMember);
    await this.processStatusUpdate(command.data.status, member, requestMember, organization);

    return new UpdateMemberStatusResponseDto(member.id);
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

  private async verifySelfMutation(member: Member, requestMember: Member): Promise<void> {
    if (member.id === requestMember.id) {
      await this.Asserter.throw('CANNOT_MODIFY_SELF');
    }
  }

  private async processStatusUpdate(
    status: MemberStatus,
    member: Member,
    requestMember: Member,
    organization: Organization,
  ): Promise<void> {
    const currentAssignment = await this.identifyCurrentAssignment(member, organization);
    const ownerCount = await OrganizationRoleAssignment.count({
      organization: { id: organization.id },
      role: { code: 'OWNER' },
      member: { status: MemberStatus.ACTIVE },
    });

    if (currentAssignment?.role.code === 'OWNER' && status === MemberStatus.INACTIVE && ownerCount <= 1) {
      await this.Asserter.throw('LAST_OWNER_STATUS_CANNOT_BE_CHANGED');
    }

    const result = await Member.getQueryBuilder()
      .update({ status })
      .where({
        $and: [
          { id: member.id },
          { organization },
          { id: { $ne: requestMember.id } },
        ],
      })
      .execute();

    if (result.affectedRows === 0) {
      await this.Asserter.throw('LAST_OWNER_STATUS_CANNOT_BE_CHANGED');
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
