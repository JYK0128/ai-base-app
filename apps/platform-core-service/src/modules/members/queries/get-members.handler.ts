import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildCreatedByEmailLookup, buildMemberOutput, filterMemberOutputs, getLinkedInvite, sortByRecentDate } from '../members.helper';
import type { MemberOutput } from '../members.types';
import { GetMembersAsserter } from './get-members.error';
import { GetMembersQuery } from './get-members.query';

@QueryHandler(GetMembersQuery)
export class GetMembersHandler implements IQueryHandler<GetMembersQuery> {
  private readonly Asserter = GetMembersAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ payload }: GetMembersQuery): Promise<MemberOutput[]> {
    const { search, status, role } = payload;
    const organization = await this.identifyOrganization();
    const requestedById = await this.identifyRequestUserId();
    const loadedMembers = await this.loadMembers(organization);
    const invites = await this.loadInvites(organization);
    const createdByEmailLookup = buildCreatedByEmailLookup(loadedMembers);

    const memberRecords = loadedMembers.map((member) => {
      const linkedInvite = getLinkedInvite(invites, member);

      return buildMemberOutput(
        member,
        organization,
        requestedById,
        createdByEmailLookup,
        linkedInvite,
      );
    });

    return sortByRecentDate(
      filterMemberOutputs(memberRecords, {
        search,
        status,
        role,
      }),
    );
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
          orderBy: { createdAt: 'DESC' },
        },
      ),
      'LOAD_FAILED',
    );
  }
}

