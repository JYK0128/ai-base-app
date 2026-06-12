import { Transactional } from '@mikro-orm/decorators/legacy';
import { raw } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager, Member, MemberStatus, Organization, OrganizationRoleAssignment } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { MemberIdRecord } from '../members.contract';
import { UpdateMemberStatusCommand } from './update-member-status.command';
import { ToggleMemberStatusAsserter } from './update-member-status.error';

@CommandHandler(UpdateMemberStatusCommand)
export class ToggleMemberStatusHandler implements ICommandHandler<UpdateMemberStatusCommand> {
  private readonly Asserter = ToggleMemberStatusAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute({ payload }: UpdateMemberStatusCommand): Promise<MemberIdRecord> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(payload.id);
    const requestMember = await this.identifyRequestMember();
    await this.validateSelfMutation(member, requestMember);

    await this.processStatusUpdate(
      member,
      requestMember,
      organization,
      payload.status,
    );

    return {
      id: member.id,
    };
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
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

  private async processStatusUpdate(
    member: Member,
    requestMember: Member,
    organization: Organization,
    status: MemberStatus,
  ): Promise<void> {
    const qb1 = this.em.createQueryBuilder(Member);
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
      .update({ status })
      .where({
        $and: [
          { id: { $ne: requestMember.id } },
          { [raw(`"ownerCount" > 1`)]: true },
        ],
      })
      .execute();

    if (result.affectedRows === 0) {
      await this.Asserter.throw('LAST_OWNER_STATUS_CANNOT_BE_CHANGED');
    }
  }
}
