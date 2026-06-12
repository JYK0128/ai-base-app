import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetMembersContract } from './get-members.contract';
import { GetMembersAsserter } from './get-members.error';
import type { GetMembersResponseDto } from './get-members.response.dto';

@QueryHandler(GetMembersContract)
export class GetMembersHandler implements IQueryHandler<GetMembersContract> {
  private readonly Asserter = GetMembersAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ data }: GetMembersContract): Promise<GetMembersResponseDto[]> {
    const organization = await this.identifyOrganization();
    const members = await this.identifyMembers(organization);

    return members
      .filter((member) => this.matchStatus(member, data.status))
      .filter((member) => this.matchRole(member, data.role))
      .filter((member) => this.matchSearch(member, data.search))
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map((member) => new GetMembersResponseDto(member));
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
  }

  private async identifyMembers(organization: Organization): Promise<Member[]> {
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

  private matchStatus(member: Member, status?: Member['status']) {
    return !status || member.status === status;
  }

  private matchRole(member: Member, role?: string) {
    if (!role) {
      return true;
    }

    return member.organizationRoles.getItems().some((assignment) => (
      assignment.role.id === role
      || assignment.role.code === role
    ));
  }

  private matchSearch(member: Member, search?: string) {
    const normalizedSearch = search?.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    const organizationRoles = member.organizationRoles.getItems();
    const accountItems = member.accounts.getItems();
    const searchTargets = [
      member.name,
      member.createdBy ?? '',
      ...accountItems.map((account) => account.email),
      ...organizationRoles.map((assignment) => assignment.role.code),
      ...organizationRoles.map((assignment) => assignment.role.name),
    ].join(' ').toLowerCase();

    return searchTargets.includes(normalizedSearch);
  }
}
