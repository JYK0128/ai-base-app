import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization } from '@pkg/database';

import { GetOrganizationListContract } from './get-organization-list.contract';
import { GetOrganizationListResponseDto, OrganizationListItem } from './get-organization-list.response.dto';

@QueryHandler(GetOrganizationListContract)
export class GetOrganizationListHandler implements IQueryHandler<GetOrganizationListContract> {
  async execute(query: GetOrganizationListContract): Promise<GetOrganizationListResponseDto> {
    this.verifyOrganizations(query);
    return this.processList(query);
  }

  private verifyOrganizations(_query: GetOrganizationListContract): void {
    // 조직 목록 조회 정책 검증 영역
  }

  private async processList(query: GetOrganizationListContract): Promise<GetOrganizationListResponseDto> {
    const { offset, limit } = query.data.toListOptions();
    const organizations = await Organization.find(
      query.data.toFilterQuery(),
      {
        ...query.data.toListOptions(),
      },
    );

    return new GetOrganizationListResponseDto({
      items: organizations.map((organization) => new OrganizationListItem(organization)),
      offset,
      limit,
    });
  }
}
