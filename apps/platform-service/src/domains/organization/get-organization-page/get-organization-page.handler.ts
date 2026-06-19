import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildOrganizationStatusFilter, CoreRepository, Organization } from '@pkg/database';

import { GetOrganizationPageContract } from './get-organization-page.contract';
import { GetOrganizationPageItemResponseDto, GetOrganizationPageResponseDto } from './get-organization-page.response.dto';

@QueryHandler(GetOrganizationPageContract)
export class GetOrganizationPageHandler implements IQueryHandler<GetOrganizationPageContract> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: CoreRepository<Organization>,
  ) {}

  async execute(query: GetOrganizationPageContract): Promise<GetOrganizationPageResponseDto> {
    const filters = query.data.filters;
    const orderBy = query.data.sort.map((field, index) => ({
      [field]: query.data.direction[index] ?? query.data.direction[0] ?? 'desc',
    }));
    const organizations = await this.organizationRepository.find(
      buildOrganizationStatusFilter(filters?.status),
      {
        orderBy,
        offset: query.data.offset,
        limit: query.data.limit,
      },
    );

    return new GetOrganizationPageResponseDto(organizations.map((organization) => new GetOrganizationPageItemResponseDto(organization)));
  }
}
