import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRepository } from '@pkg/database';

export { GetOrganizationsQuery } from './get-organizations.helpers';
import { GetOrganizationsQuery } from './get-organizations.helpers';

@QueryHandler(GetOrganizationsQuery)
export class GetOrganizationsHandler implements IQueryHandler<GetOrganizationsQuery> {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: OrganizationRepository,
  ) {}

  async execute(query: GetOrganizationsQuery): Promise<Organization[]> {
    const filter = query.status ? { status: query.status } : {};
    return this.organizationRepo.find(filter, {
      orderBy: { createdAt: 'DESC' },
    });
  }
}
