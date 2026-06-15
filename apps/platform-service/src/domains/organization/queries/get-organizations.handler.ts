import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildOrganizationStatusFilter, CoreRepository, Organization } from '@pkg/database';

import { GetOrganizationsContract } from './get-organizations.contract';
import { GetOrganizationResponseDto, GetOrganizationsResponseDto } from './get-organizations.response.dto';

@QueryHandler(GetOrganizationsContract)
export class GetOrganizationsHandler implements IQueryHandler<GetOrganizationsContract> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: CoreRepository<Organization>,
  ) {}

  async execute(query: GetOrganizationsContract): Promise<GetOrganizationsResponseDto> {
    const orderBy = query.data.sort.map((field, index) => ({
      [field]: query.data.direction[index] ?? query.data.direction[0] ?? 'desc',
    }));
    const organizations = await this.organizationRepository.find(
      buildOrganizationStatusFilter(query.data.status),
      {
        orderBy,
        offset: query.data.offset,
        limit: query.data.limit,
      },
    );

    return new GetOrganizationsResponseDto(organizations.map((organization) => new GetOrganizationResponseDto(organization)));
  }
}
