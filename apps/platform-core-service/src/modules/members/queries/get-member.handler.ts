import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import type { MemberRecord } from '../members.contract';
import { buildMemberRecord } from '../members.helper';
import { GetMemberAsserter } from './get-member.error';
import { GetMemberQuery } from './get-member.query';

@QueryHandler(GetMemberQuery)
export class GetMemberHandler implements IQueryHandler<GetMemberQuery> {
  private readonly Asserter = GetMemberAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ payload }: GetMemberQuery): Promise<MemberRecord> {
    const { id } = payload;
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, id);

    return buildMemberRecord(member);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
  }

  private async identifyMember(organization: Organization, id: string): Promise<Member> {
    return await this.Asserter.assert(
      Member.findOne(
        { id, organization },
        {
          populate: ['accounts', 'organizationRoles.role', 'organizationRoles.organization'],
        },
      ),
      'MEMBER_NOT_FOUND',
    );
  }
}
