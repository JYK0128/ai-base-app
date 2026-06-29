import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetMemberContract } from './get-member.contract';
import { GetMemberAsserter } from './get-member.error';
import { GetMemberResponseDto } from './get-member.response.dto';

@QueryHandler(GetMemberContract)
export class GetMemberHandler implements IQueryHandler<GetMemberContract> {
  private readonly Asserter = GetMemberAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetMemberContract): Promise<GetMemberResponseDto> {
    const organization = await this.identifyOrganization();
    this.verifyMember(query, organization);

    return this.processDetail(query, organization);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organization.id);
  }

  private verifyMember(_query: GetMemberContract, _organization: Organization): void {
    // 멤버 조회 정책 검증 영역
  }

  private async processDetail(query: GetMemberContract, organization: Organization): Promise<GetMemberResponseDto> {
    const member = await this.Asserter.assert(
      Member.findOne(
        { id: query.data.id, organization },
        {
          populate: ['accounts', 'roles.role', 'roles.organization'],
        },
      ),
      'MEMBER_NOT_FOUND',
    );

    return new GetMemberResponseDto(member);
  }
}
