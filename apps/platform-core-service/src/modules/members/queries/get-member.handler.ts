import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildInviteRecord } from '../members.helper';
import type { MemberOutput } from '../members.types';
import { GetMemberAsserter } from './get-member.error';
import { GetMemberQuery } from './get-member.query';

@QueryHandler(GetMemberQuery)
export class GetMemberHandler implements IQueryHandler<GetMemberQuery> {
  private readonly Asserter = GetMemberAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ payload }: GetMemberQuery): Promise<MemberOutput> {
    const organization = await this.identifyOrganization();
    const invites = await this.loadInvites(organization);

    return invites.map((invite) => buildInviteRecord(invite));
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

  private async identifyRequestUserId(): Promise<string> {
    const requestedById = this.cls.get('accountId');

    if (!requestedById) {
      return this.Asserter.throw('REQUEST_CONTEXT_NOT_FOUND');
    }

    return requestedById;
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

  private async loadMembers(organization: Organization): Promise<Member[]> {
    return await this.Asserter.assert(
      Member.find(
        { organization },
        {
          populate: ['accounts', 'organizationRoles.role', 'organizationRoles.organization'],
          orderBy: { createdAt: 'DESC' },
        },
      ),
      'LOAD_FAILED',
    );
  }

  private async loadInvites(organization: Organization): Promise<MemberInvite[]> {
    return await this.Asserter.assert(
      MemberInvite.find(
        { organization },
        {
          populate: ['role'],
        },
      ),
      'LOAD_FAILED',
    );
  }
}
