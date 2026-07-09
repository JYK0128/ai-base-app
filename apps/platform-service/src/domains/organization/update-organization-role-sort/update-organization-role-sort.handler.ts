import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Organization, OrganizationRole } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { OrganizationRoleAsserter } from '../organization-role.errors';
import { UpdateOrganizationRoleSortContract } from './update-organization-role-sort.contract';
import { UpdateOrganizationRoleSortResponseDto } from './update-organization-role-sort.response.dto';

@CommandHandler(UpdateOrganizationRoleSortContract)
export class UpdateOrganizationRoleSortHandler implements ICommandHandler<UpdateOrganizationRoleSortContract> {
  private readonly Asserter = OrganizationRoleAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: UpdateOrganizationRoleSortContract): Promise<UpdateOrganizationRoleSortResponseDto> {
    const organization = await this.identifyOrganization();
    await this.processSort(organization, command);

    return new UpdateOrganizationRoleSortResponseDto(command.data.items.map((item) => item.id));
  }

  private async identifyOrganization(): Promise<Organization> {
    const organization = this.cls.get<AuthOrganizationContext>('organization');

    if (!organization) {
      return this.Asserter.throw('ORGANIZATION_NOT_FOUND');
    }

    return await this.Asserter.assert(
      Organization.findOne({ id: organization.id }),
      'ORGANIZATION_NOT_FOUND',
    );
  }

  private async processSort(
    organization: Organization,
    command: UpdateOrganizationRoleSortContract,
  ): Promise<void> {
    for (const item of command.data.items) {
      const role = await this.Asserter.assert(
        OrganizationRole.findOne({ id: item.id, organization }),
        'ORGANIZATION_ROLE_NOT_FOUND',
      );

      role.sortOrder = item.sortOrder;
    }
  }
}
