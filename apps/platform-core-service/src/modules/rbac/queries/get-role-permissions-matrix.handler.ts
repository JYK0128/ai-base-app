import { EntityManager } from '@mikro-orm/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RolePermission } from '@pkg/database';

import { GetRolePermissionsMatrixAsserter, GetRolePermissionsMatrixCommand } from './get-role-permissions-matrix.helpers';

/**
 * 역할별 권한 매핑 매트릭스 전체 조회 핸들러
 */
@CommandHandler(GetRolePermissionsMatrixCommand)
export class GetRolePermissionsMatrixHandler implements ICommandHandler<GetRolePermissionsMatrixCommand> {
  private readonly Asserter = GetRolePermissionsMatrixAsserter;

  constructor(private readonly em: EntityManager) {}

  async execute(_command: GetRolePermissionsMatrixCommand): Promise<Record<string, string[]>> {
    const rolePermissions = await this.identifyRolePermissions();
    return this.processRolePermissions(rolePermissions);
  }

  private async identifyRolePermissions(): Promise<RolePermission[]> {
    return await this.Asserter.assert(
      this.em.find(
        RolePermission,
        {},
        { populate: ['role', 'permission', 'permission.resource'] },
      ),
      'LOAD_FAILED',
    );
  }

  private processRolePermissions(rolePermissions: RolePermission[]): Record<string, string[]> {
    const matrix: Record<string, string[]> = {};
    for (const rp of rolePermissions) {
      if (!rp.role || !rp.permission) continue;
      const roleCode = rp.role.code;
      const permCode = rp.permission.code;

      if (!matrix[roleCode]) {
        matrix[roleCode] = [];
      }
      matrix[roleCode].push(permCode);
    }
    return matrix;
  }
}
