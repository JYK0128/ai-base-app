import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRepository } from '@pkg/database';

import { GetOrganizationsAsserter, GetOrganizationsQuery } from './get-organizations.helpers';

/**
 * 조직 목록 조회 핸들러
 */
@QueryHandler(GetOrganizationsQuery)
export class GetOrganizationsHandler implements IQueryHandler<GetOrganizationsQuery> {
  private readonly Asserter = GetOrganizationsAsserter;

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
