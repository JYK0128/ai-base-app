import { Transactional } from '@mikro-orm/decorators/legacy';
import { raw } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { type EntityManager, Member, MemberStatus, Organization, OrganizationRole, OrganizationRoleAssignment } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { MemberIdRecord } from '../members.contract';
import { UpdateMemberRoleCommand } from './update-member-role.command';
import { UpdateMemberRoleAsserter } from './update-member-role.error';

@CommandHandler(UpdateMemberRoleCommand)
export class UpdateMemberRoleHandler implements ICommandHandler<UpdateMemberRoleCommand> {
  private readonly Asserter = UpdateMemberRoleAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute({ payload }: UpdateMemberRoleCommand): Promise<MemberIdRecord> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(payload.id);
    const requestMember = await this.identifyRequestMember();
    const role = await this.identifyRole(payload.roleId);
    await this.validateSelfMutation(member, requestMember);

    await this.processRoleUpdate(member, requestMember, organization, role);

    return {
      id: member.id,
    };
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

  private async identifyMember(memberId: string): Promise<Member> {
    return Member.getReference(memberId);
  }

  private async validateSelfMutation(member: Member, requestMember: Member): Promise<void> {
    if (member.id === requestMember.id) {
      await this.Asserter.throw('CANNOT_MODIFY_SELF');
    }
  }

  private async identifyRole(roleId: string): Promise<OrganizationRole> {
    return OrganizationRole.getReference(roleId);
  }

  private async processRoleUpdate(
    member: Member,
    requestMember: Member,
    organization: Organization,
    role: OrganizationRole,
  ): Promise<void> {
    const qb1 = this.em.createQueryBuilder(OrganizationRoleAssignment);
    const qb2 = this.em.createQueryBuilder(OrganizationRoleAssignment);

    const kysely = this.em.getKysely();
    kysely.selectFrom('announcement');

    const subquery = qb2
      .count()
      .where({
        organization: { id: organization.id },
        role: { code: 'OWNER' },
        member: { status: MemberStatus.ACTIVE },
      }).getNativeQuery();

    const result = await qb1
      .withSubQuery(subquery, 'ownerCount')
      .update({ role: role })
      .where({
        $and: [
          { $not: { member: requestMember } },
          { member, organization },
          { [raw(`"ownerCount" > 1`)]: true },
        ],
      })
      .execute();

    if (result.affectedRows === 0) {
      await this.Asserter.throw('LAST_OWNER_ROLE_CANNOT_BE_CHANGED');
    }
  }
}
