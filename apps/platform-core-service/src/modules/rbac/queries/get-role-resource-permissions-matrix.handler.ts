import { EntityManager } from '@mikro-orm/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Permission, Resource, RolePermission } from '@pkg/database';

import { GetRoleResourcePermissionsMatrixAsserter,
         GetRoleResourcePermissionsMatrixCommand } from './get-role-resource-permissions-matrix.helpers';

export interface RoleResourcePermissionsMatrix {
  [roleCode: string]: {
    [resourceCode: string]: string[]
  }
}

/**
 * 역할-자원-권한 매트릭스 전체 조회 핸들러
 */
@CommandHandler(GetRoleResourcePermissionsMatrixCommand)
export class GetRoleResourcePermissionsMatrixHandler implements ICommandHandler<GetRoleResourcePermissionsMatrixCommand> {
  private readonly Asserter = GetRoleResourcePermissionsMatrixAsserter;

  constructor(private readonly em: EntityManager) {}

  async execute(_command: GetRoleResourcePermissionsMatrixCommand): Promise<RoleResourcePermissionsMatrix> {
    const rolePermissions = await this.identifyRolePermissions();
    return this.processRolePermissions(rolePermissions);
  }

  private async identifyRolePermissions(): Promise<RolePermission[]> {
    return await this.Asserter.assert(
      this.em.find(RolePermission, {}, { populate: ['role', 'permission', 'permission.resource'] }),
      'LOAD_FAILED',
    );
  }

  private processRolePermissions(rolePermissions: RolePermission[]): RoleResourcePermissionsMatrix {
    const matrix: RoleResourcePermissionsMatrix = {};
    for (const rp of rolePermissions) {
      if (!rp.role || !rp.permission) continue;
      const roleCode = rp.role.code;
      const perm = rp.permission as Permission & { resource?: Resource };
      const permCode = perm.code;
      const resource = perm.resource;
      if (!resource) continue;
      const resourceCode = resource.code;

      if (!matrix[roleCode]) matrix[roleCode] = {};
      if (!matrix[roleCode][resourceCode]) matrix[roleCode][resourceCode] = [];
      matrix[roleCode][resourceCode].push(permCode);
    }
    return matrix;
  }
}
