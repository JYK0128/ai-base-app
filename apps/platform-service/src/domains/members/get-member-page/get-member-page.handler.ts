import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetMemberPageContract } from './get-member-page.contract';
import { GetMemberPageAsserter } from './get-member-page.error';
import { GetMemberPageItemResponseDto, GetMemberPageResponseDto } from './get-member-page.response.dto';

@QueryHandler(GetMemberPageContract)
export class GetMemberPageHandler implements IQueryHandler<GetMemberPageContract> {
  private readonly Asserter = GetMemberPageAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute({ data }: GetMemberPageContract): Promise<GetMemberPageResponseDto> {
    const organization = await this.identifyOrganization();
    const members = await this.identifyMembers(organization);
    const filters = data.filters;
    const sort = data.sort?.length ? data.sort : ['createdAt' as const];
    const direction = data.direction?.length ? data.direction : ['desc'];
    const sortedMembers = this.sortMembers(members, sort, direction);
    const filteredMembers = sortedMembers
      .filter((member) => this.matchStatus(member, filters?.status))
      .filter((member) => this.matchSearch(member, filters?.search));
    const page = Math.max(1, data.page ?? 1);
    const limit = Math.max(1, data.limit ?? 20);
    const offset = (page - 1) * limit;
    const totalCount = filteredMembers.length;
    const totalPages = Math.ceil(totalCount / limit);
    const items = filteredMembers
      .slice(offset, offset + limit)
      .map((member) => new GetMemberPageItemResponseDto(member));

    return new GetMemberPageResponseDto(
      items,
      totalCount,
      page,
      limit,
      totalPages,
      page < totalPages,
      page > 1,
    );
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
          populate: ['accounts', 'roles.role', 'roles.organization'],
          orderBy: { createdAt: 'DESC' },
        },
      ),
      'LOAD_FAILED',
    );
  }

  private sortMembers(
    members: Member[],
    sort: Array<Extract<keyof Member, string>>,
    direction: string[],
  ): Member[] {
    return [...members].sort((left, right) => {
      for (const [index, field] of sort.entries()) {
        const order = direction[index] ?? direction[0] ?? 'desc';
        const comparison = this.compareValues(left[field], right[field]);

        if (comparison !== 0) {
          return order === 'asc' ? comparison : -comparison;
        }
      }

      return 0;
    });
  }

  private compareValues(left: unknown, right: unknown): number {
    if (left instanceof Date && right instanceof Date) {
      return left.getTime() - right.getTime();
    }

    if (typeof left === 'string' && typeof right === 'string') {
      return left.localeCompare(right);
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return Number(left) - Number(right);
    }

    return 0;
  }

  private matchStatus(member: Member, status?: Member['status'] | Array<Member['status']>) {
    if (!status) {
      return true;
    }

    return Array.isArray(status)
      ? status.includes(member.status)
      : member.status === status;
  }

  private matchSearch(member: Member, search?: string) {
    const normalizedSearch = search?.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    const organizationRoles = member.roles.getItems();
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
