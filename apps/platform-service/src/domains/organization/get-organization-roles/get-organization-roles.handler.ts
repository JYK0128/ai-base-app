import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, Organization, OrganizationRole } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetOrganizationRolesContract } from './get-organization-roles.contract';
import { GetOrganizationRolesAsserter } from './get-organization-roles.error';
import { GetOrganizationRoleResponseDto } from './get-organization-roles.response.dto';

@QueryHandler(GetOrganizationRolesContract)
export class GetOrganizationRolesHandler implements IQueryHandler<GetOrganizationRolesContract> {
  private readonly Asserter = GetOrganizationRolesAsserter;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: CoreRepository<Organization>,
    @InjectRepository(OrganizationRole)
    private readonly roleRepository: CoreRepository<OrganizationRole>,
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<GetOrganizationRoleResponseDto[]> {
    const organization = await this.identifyOrganization();
    const roles = await this.loadRoles(organization);

    return roles.map((role) => new GetOrganizationRoleResponseDto(role));
  }

  private async identifyOrganization(): Promise<Organization> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      this.organizationRepository.findOne({ id: organizationId }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async loadRoles(organization: Organization): Promise<OrganizationRole[]> {
    return await this.Asserter.assert(
      this.roleRepository.find(
        { organization, deletedAt: null },
        {
          orderBy: { createdAt: 'ASC' },
        },
      ),
      'LOAD_FAILED',
    );
  }
}
