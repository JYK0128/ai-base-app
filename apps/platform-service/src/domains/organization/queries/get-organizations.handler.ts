import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, Organization, OrganizationStatus } from '@pkg/database';

import { GetOrganizationsContract } from './get-organizations.contract';
import { GetOrganizationResponseDto, GetOrganizationsResponseDto } from './get-organizations.response.dto';

@QueryHandler(GetOrganizationsContract)
export class GetOrganizationsHandler implements IQueryHandler<GetOrganizationsContract> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: CoreRepository<Organization>,
  ) {}

  async execute(query: GetOrganizationsContract): Promise<GetOrganizationsResponseDto> {
    const filter = this.buildFilter(query.data.status);
    const orderBy = query.data.sort.map((field, index) => ({
      [field]: query.data.direction[index] ?? query.data.direction[0] ?? 'desc',
    }));
    const organizations = await this.organizationRepository.find(filter, {
      orderBy,
      offset: query.data.offset,
      limit: query.data.limit,
    });

    return new GetOrganizationsResponseDto(organizations.map((organization) => new GetOrganizationResponseDto(organization)));
  }

  private buildFilter(status?: OrganizationStatus) {
    if (!status) {
      return {};
    }

    if (status === OrganizationStatus.PENDING) {
      return { metadata: { approvedAt: null, deactivatedAt: null, rejectedAt: null } };
    }

    if (status === OrganizationStatus.ACTIVE) {
      return { metadata: { approvedAt: { $ne: null }, deactivatedAt: null, rejectedAt: null } };
    }

    if (status === OrganizationStatus.INACTIVE) {
      return { metadata: { deactivatedAt: { $ne: null } } };
    }

    return { metadata: { rejectedAt: { $ne: null } } };
  }
}
