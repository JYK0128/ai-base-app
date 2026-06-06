import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, MemberInviteRepository, MemberRepository, Organization, OrganizationRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildCreatedByEmailLookup, buildMemberRecord, filterMemberRecords, getLinkedInvite, sortByRecentDate } from '../members.mapper';
import type { MemberRecord } from '../members.types';
import { GetMembersAsserter } from './get-members.error';
import { GetMembersQuery } from './get-members.query';

@QueryHandler(GetMembersQuery)
export class GetMembersHandler implements IQueryHandler<GetMembersQuery> {
  private readonly Asserter = GetMembersAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(Member)
    private readonly memberRepo: MemberRepository,
    @InjectRepository(MemberInvite)
    private readonly inviteRepo: MemberInviteRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetMembersQuery): Promise<MemberRecord[]> {
    const organization = await this.identifyOrganization();
    const requestedById = await this.identifyRequestUserId();
    const loadedMembers = await this.loadMembers(organization);
    const invites = await this.loadInvites(organization);
    const createdByEmailLookup = buildCreatedByEmailLookup(loadedMembers);

    const memberRecords = loadedMembers.map((member) => {
      const linkedInvite = getLinkedInvite(invites, member);

      return buildMemberRecord(
        member,
        organization,
        requestedById,
        createdByEmailLookup,
        linkedInvite,
      );
    });

    return sortByRecentDate(
      filterMemberRecords(memberRecords, {
        search: query.search,
        status: query.status,
        role: query.role,
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
