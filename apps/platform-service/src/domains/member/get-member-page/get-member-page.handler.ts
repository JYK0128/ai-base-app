import type { FilterQuery } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Member, Organization } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import type { PageFindOptions } from '@/common/interfaces';

import { GetMemberPageContract } from './get-member-page.contract';
import { GetMemberPageAsserter } from './get-member-page.error';
import { GetMemberPageResponseDto, MemberPageItem } from './get-member-page.response.dto';

@QueryHandler(GetMemberPageContract)
export class GetMemberPageHandler implements IQueryHandler<GetMemberPageContract> {
  private readonly Asserter = GetMemberPageAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetMemberPageContract): Promise<GetMemberPageResponseDto> {
    const organization = await this.identifyOrganization();
    this.verifyMemberPage(organization, query);
    return this.processPage(query, organization);
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organization.id);
  }

  private verifyMemberPage(_organization: Organization, _query: GetMemberPageContract): void {
    // 멤버 목록 조회 정책 검증 영역
  }

  private async processPage(
    query: GetMemberPageContract,
    organization: Organization,
  ): Promise<GetMemberPageResponseDto> {
    const filter = {
      organization,
      deletedAt: null,
      ...query.data.toFilterQuery(),
    } as FilterQuery<Member>;

    const membersPage = await Member.findByPage<Member, 'accounts' | 'roles.role'>(
      filter,
      {
        populate: ['accounts', 'roles.role'],
        ...query.data.toPageOptions((pageOptions) => {
          const orderBy: PageFindOptions<Member>['orderBy'] = {};

          query.data.sort.forEach((field, index) => {
            const direction = query.data.direction[index] ?? 'asc';

            if (field === 'lastLoginAt') {
              orderBy.accounts = { lastLoginAt: direction };
              return;
            }

            orderBy[field] = direction;
          });

          return {
            ...pageOptions,
            orderBy,
          };
        }),
      },
    );

    return new GetMemberPageResponseDto({
      ...membersPage,
      items: membersPage.items.map((member) => new MemberPageItem(member)),
    });
  }
}
