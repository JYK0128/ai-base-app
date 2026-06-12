import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, Organization } from '@pkg/database';

import { buildOrganizationResponse } from '../organization.helper';
import { GetOrganizationsContract } from './get-organizations.contract';
import { GetOrganizationsResponseDto } from './get-organizations.response.dto';

@QueryHandler(GetOrganizationsContract)
export class GetOrganizationsHandler implements IQueryHandler<GetOrganizationsContract> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: CoreRepository<Organization>,
  ) {}

  async execute(query: GetOrganizationsContract): Promise<GetOrganizationsResponseDto> {
    const filter = query.data.status ? { status: query.data.status } : {};
    const organizations = await this.organizationRepository.find(filter, {
      orderBy: { createdAt: 'DESC' },
    });

    return new GetOrganizationsResponseDto(organizations.map(buildOrganizationResponse));
  }
}
