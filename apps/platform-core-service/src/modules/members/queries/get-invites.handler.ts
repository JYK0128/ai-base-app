import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildCreatedByEmailLookup, buildInviteOutput, filterInviteOutputs, getLinkedMember, sortByRecentDate } from '../members.helper';
import type { InviteOutput } from '../members.types';
import { GetInvitesAsserter } from './get-invites.error';
import { GetInvitesQuery } from './get-invites.query';

@QueryHandler(GetInvitesQuery)
export class GetInvitesHandler implements IQueryHandler<GetInvitesQuery> {
  private readonly Asserter = GetInvitesAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ payload }: GetInvitesQuery): Promise<InviteOutput[]> {
    const { search, inviteStatus, role } = payload;
    const organization = await this.identifyOrganization();
    const requestedById = await this.identifyRequestUserId();
    const invites = await this.loadInvites(organization);
    const members = await this.loadMembers(organization);
    const createdByEmailLookup = buildCreatedByEmailLookup(members);

    const records = invites.map((invite) => buildInviteOutput(
      invite,
      organization,
      requestedById,
      createdByEmailLookup,
      getLinkedMember(members, invite),
    ));

    return sortByRecentDate(
      filterInviteOutputs(records, {
        search,
        inviteStatus,
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

