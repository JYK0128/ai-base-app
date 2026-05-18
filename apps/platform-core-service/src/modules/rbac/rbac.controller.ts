import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UpdateRolePermissionsCommand } from './commands';
import { GetResourcesCommand, GetRolePermissionsMatrixCommand, GetRoleResourcePermissionsMatrixCommand, GetRolesCommand } from './queries';

@Controller()
export class RbacController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern('rbac.resources.get')
  async getResources() {
    return this.commandBus.execute(new GetResourcesCommand());
  }

  @MessagePattern('rbac.roles.get')
  async getRoles() {
    return this.commandBus.execute(new GetRolesCommand());
  }

  @MessagePattern('rbac.role_permissions.matrix.get')
  async getRolePermissionsMatrix() {
    return this.commandBus.execute(new GetRolePermissionsMatrixCommand());
  }

  @MessagePattern('rbac.role_permissions.resource_matrix.get')
  async getRoleResourcePermissionsMatrix() {
    return this.commandBus.execute(new GetRoleResourcePermissionsMatrixCommand());
  }

  @MessagePattern('rbac.role_permissions.update')
  async updateRolePermissions(@Payload() data: { roleCode: string, permissionCodes: string[] }) {
    return this.commandBus.execute(new UpdateRolePermissionsCommand(data.roleCode, data.permissionCodes));
  }
}
