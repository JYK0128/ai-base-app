import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, Organization, OrganizationRole } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { buildPermissionSetRecord } from '../permission-sets.helpers';
import { GetPermissionSetsAsserter } from './get-permission-sets.error';
import { GetPermissionSetsQuery } from './get-permission-sets.query';

@QueryHandler(GetPermissionSetsQuery)
export class GetPermissionSetsHandler implements IQueryHandler<GetPermissionSetsQuery> {
  private readonly Asserter = GetPermissionSetsAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepo: CoreRepository<Organization>,
    @InjectRepository(OrganizationRole)
    private readonly roleRepo: CoreRepository<OrganizationRole>,
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<unknown> {
    const organization = await this.identifyOrganization();
    const roles = await this.loadRoles(organization);

    return roles.map((role) => buildPermissionSetRecord(role));
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      this.organizationRepo.findOne({ id: organizationId }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async loadRoles(organization: Organization): Promise<OrganizationRole[]> {
    return await this.Asserter.assert(
      this.roleRepo.find(
        { organization, deletedAt: null },
        {
          populate: ['permissions.resource', 'assignments'],
          orderBy: { createdAt: 'ASC' },
        },
      ),
      'LOAD_FAILED',
    );
  }
}
