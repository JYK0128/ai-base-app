import { Transactional } from '@mikro-orm/decorators/legacy';
import { raw } from '@mikro-orm/postgresql';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { EntityManager, Member, MemberStatus, Organization, OrganizationRole, OrganizationRoleAssignment } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { UpdateMemberRoleContract } from './update-member-role.contract';
import { UpdateMemberRoleAsserter } from './update-member-role.error';
import { UpdateMemberRoleResponseDto } from './update-member-role.response.dto';

@CommandHandler(UpdateMemberRoleContract)
export class UpdateMemberRoleHandler implements ICommandHandler<UpdateMemberRoleContract> {
  private readonly Asserter = UpdateMemberRoleAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute({ data }: UpdateMemberRoleContract): Promise<UpdateMemberRoleResponseDto> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, data.id);
    const requestMember = await this.identifyRequestMember();
    const role = await this.identifyRole(organization, data.roleId);

    await this.validateSelfMutation(member, requestMember);
    await this.processRoleUpdate(member, requestMember, organization, role);

    return new UpdateMemberRoleResponseDto(member.id);
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

  private async identifyRequestMember(): Promise<Member> {
    const memberId = this.cls.get('memberId');

    if (!memberId) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return Member.getReference(memberId);
  }

  private async identifyMember(organization: Organization, memberId: string): Promise<Member> {
    return await this.Asserter.assert(
      Member.findOne({ id: memberId, organization }),
      'MEMBER_NOT_FOUND',
    );
  }

  private async identifyRole(organization: Organization, roleId: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      OrganizationRole.findOne({ id: roleId, organization }),
      'ROLE_NOT_FOUND',
    );
  }

  private async validateSelfMutation(member: Member, requestMember: Member): Promise<void> {
    if (member.id === requestMember.id) {
      await this.Asserter.throw('CANNOT_MODIFY_SELF');
    }
  }

  private async processRoleUpdate(
    member: Member,
    requestMember: Member,
    organization: Organization,
    role: OrganizationRole,
  ): Promise<void> {
    const qb1 = this.em.createQueryBuilder(OrganizationRoleAssignment);
    const qb2 = this.em.createQueryBuilder(OrganizationRoleAssignment);

    const subquery = qb2
      .count()
      .where({
        organization: { id: organization.id },
        role: { code: 'OWNER' },
        member: { status: MemberStatus.ACTIVE },
      })
      .getNativeQuery();

    const result = await qb1
      .withSubQuery(subquery, 'ownerCount')
      .update({ role })
      .where({
        $and: [
          { member },
          { organization },
          { member: { id: { $ne: requestMember.id } } },
          { [raw(`"ownerCount" > 1`)]: true },
        ],
      })
      .execute();

    if (result.affectedRows === 0) {
      await this.Asserter.throw('LAST_OWNER_ROLE_CANNOT_BE_CHANGED');
    }
  }
}
