import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetPermissionSetsContract } from './get-permission-sets.contract';
import { GetPermissionSetsAsserter } from './get-permission-sets.error';
import { GetPermissionSetResponseDto } from './get-permission-sets.response.dto';

@QueryHandler(GetPermissionSetsContract)
export class GetPermissionSetsHandler implements IQueryHandler<GetPermissionSetsContract> {
  private readonly Asserter = GetPermissionSetsAsserter;

  constructor(private readonly cls: ClsService) {}

  async execute(): Promise<GetPermissionSetResponseDto[]> {
    const organization = await this.identifyOrganization();
    const roles = await this.loadRoles(organization);
    return roles.map((role) => new GetPermissionSetResponseDto(role));
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return Organization.getReference(organizationId);
  }

  private async loadRoles(
    organization: Organization,
  ): Promise<OrganizationRole[]> {
    return this.Asserter.assert(
      OrganizationRole.getQueryBuilder('role')
        .leftJoinAndSelect('permissions', 'permission')
        .leftJoinAndSelect('permission.resource', 'resource')
        .where({
          organization,
          deletedAt: null,
        })
        .getResultList(),
      'LOAD_FAILED',
    );
  }
}
