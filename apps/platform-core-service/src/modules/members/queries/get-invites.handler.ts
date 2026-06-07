import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, MemberInviteRepository, MemberRepository, Organization, OrganizationRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildCreatedByEmailLookup, buildInviteRecord, filterInviteRecords, getLinkedMember, sortByRecentDate } from '../members.helper';
import type { InviteRecord } from '../members.types';
import { GetInvitesAsserter } from './get-invites.error';
import { GetInvitesQuery } from './get-invites.query';

@QueryHandler(GetInvitesQuery)
export class GetInvitesHandler implements IQueryHandler<GetInvitesQuery> {
  private readonly Asserter = GetInvitesAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(Member)
    private readonly memberRepo: MemberRepository,
    @InjectRepository(MemberInvite)
    private readonly inviteRepo: MemberInviteRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetInvitesQuery): Promise<InviteRecord[]> {
    const { search, inviteStatus, role } = query.payload;
    const organization = await this.identifyOrganization();
    const requestedById = await this.identifyRequestUserId();
    const invites = await this.loadInvites(organization);
    const members = await this.loadMembers(organization);
    const createdByEmailLookup = buildCreatedByEmailLookup(members);

    const records = invites.map((invite) => buildInviteRecord(
      invite,
      organization,
      requestedById,
      createdByEmailLookup,
      getLinkedMember(members, invite),
    ));

    return sortByRecentDate(
      filterInviteRecords(records, {
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
      this.organizationRepo.findOne({ id: organizationId }),
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

  private async loadMembers(organization: Organization) {
    return await this.Asserter.assert(
      this.memberRepo.find(
        { organization },
        {
          populate: ['accounts', 'organizationRoles.role', 'organizationRoles.organization'],
          orderBy: { createdAt: 'DESC' },
        },
      ),
      'LOAD_FAILED',
    );
  }

  private async loadInvites(organization: Organization) {
    return await this.Asserter.assert(
      this.inviteRepo.find(
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
