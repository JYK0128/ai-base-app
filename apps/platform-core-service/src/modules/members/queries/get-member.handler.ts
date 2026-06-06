import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, MemberInvite, MemberInviteRepository, MemberRepository, Organization, OrganizationRepository } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildCreatedByEmailLookup, buildMemberRecord, getLinkedInvite } from '../members.mapper';
import type { MemberRecord } from '../members.types';
import { GetMemberAsserter } from './get-member.error';
import { GetMemberQuery } from './get-member.query';

@QueryHandler(GetMemberQuery)
export class GetMemberHandler implements IQueryHandler<GetMemberQuery> {
  private readonly Asserter = GetMemberAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
    @InjectRepository(Member)
    private readonly memberRepo: MemberRepository,
    @InjectRepository(MemberInvite)
    private readonly inviteRepo: MemberInviteRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetMemberQuery): Promise<MemberRecord> {
    const organization = await this.identifyOrganization();
    const member = await this.identifyMember(organization, query.payload.id);
    const members = await this.loadMembers(organization);
    const invites = await this.loadInvites(organization);
    const createdByEmailLookup = buildCreatedByEmailLookup(members);
    const linkedInvite = getLinkedInvite(invites, member);
    const requestedById = await this.identifyRequestUserId();

    return buildMemberRecord(
      member,
      organization,
      requestedById,
      createdByEmailLookup,
      linkedInvite,
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

  private async identifyMember(organization: Organization, id: string): Promise<Member> {
    return await this.Asserter.assert(
      this.memberRepo.findOne(
        { id, organization },
        {
          populate: ['accounts', 'organizationRoles.role', 'organizationRoles.organization'],
        },
      ),
      'MEMBER_NOT_FOUND',
    );
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
        },
      ),
      'LOAD_FAILED',
    );
  }
}
