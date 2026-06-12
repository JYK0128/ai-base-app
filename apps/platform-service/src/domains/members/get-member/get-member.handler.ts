import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildMemberResponse } from '../members.helper';
import { GetMemberContract } from './get-member.contract';
import { GetMemberAsserter } from './get-member.error';
import type { MemberResponseDto } from './get-member.response.dto';

@QueryHandler(GetMemberContract)
export class GetMemberHandler implements IQueryHandler<GetMemberContract> {
  private readonly Asserter = GetMemberAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ data }: GetMemberContract): Promise<MemberResponseDto> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, data.id);

    return buildMemberResponse(member);
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
