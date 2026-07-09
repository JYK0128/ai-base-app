import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Organization, OrganizationPermission, OrganizationRole, Resource } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { UpdatePermissionSetPermissionsContract } from './update-permission-set-permissions.contract';
import { UpdatePermissionSetPermissionsAsserter } from './update-permission-set-permissions.error';
import { UpdatePermissionSetPermissionsResponseDto } from './update-permission-set-permissions.response.dto';

type ParsedPermissionCode = {
  resourceCode: string
  action: string
};

@CommandHandler(UpdatePermissionSetPermissionsContract)
export class UpdatePermissionSetPermissionsHandler implements ICommandHandler<UpdatePermissionSetPermissionsContract> {
  private readonly Asserter = UpdatePermissionSetPermissionsAsserter;

  constructor(private readonly cls: ClsService) {}

  @Transactional()
  async execute(command: UpdatePermissionSetPermissionsContract): Promise<UpdatePermissionSetPermissionsResponseDto> {
    const organization = await this.identifyOrganization();
    const role = await this.identifyRole(organization, command.data.id);
    const permissionCodes = command.data.permissionCodes?.map((permissionCode) => permissionCode.trim().toUpperCase());

    await this.processPermissions(role, permissionCodes);

    return new UpdatePermissionSetPermissionsResponseDto(role.id);
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

  private async identifyRole(organization: Organization, roleId: string): Promise<OrganizationRole> {
    return await this.Asserter.assert(
      OrganizationRole.findOne({ id: roleId, organization }),
      'ROLE_NOT_FOUND',
    );
  }

  private async processPermissions(role: OrganizationRole, permissionCodes: string[] | undefined): Promise<void> {
    if (!permissionCodes) {
      return;
    }

    const nextPermissions = await this.buildPermissions(role, permissionCodes);
    await OrganizationPermission.nativeDelete({ role });

    for (const permission of nextPermissions) {
      OrganizationPermission.create(permission);
    }
  }

  private async buildPermissions(
    role: OrganizationRole,
    permissionCodes: string[],
  ): Promise<Array<{
    role: OrganizationRole
    resource: Resource
    action: string
  }>> {
    const permissions: Array<{
      role: OrganizationRole
      resource: Resource
      action: string
    }> = [];

    for (const permissionCode of permissionCodes) {
      const parsed = await this.parsePermissionCode(permissionCode);
      const resource = await this.Asserter.assert(
        Resource.findOne({ code: parsed.resourceCode }),
        'RESOURCE_NOT_FOUND',
      );

      permissions.push({
        role,
        resource,
        action: parsed.action,
      });
    }

    return permissions;
  }

  private async parsePermissionCode(permissionCode: string): Promise<ParsedPermissionCode> {
    const [resourceCode, action] = permissionCode.split(':');

    if (!resourceCode || !action) {
      return this.Asserter.throw('INVALID_PERMISSION_CODE');
    }

    return {
      resourceCode,
      action,
    };
  }
}
