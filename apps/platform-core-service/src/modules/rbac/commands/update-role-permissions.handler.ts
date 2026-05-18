import { EntityManager } from '@mikro-orm/core';
import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Permission, Role, RolePermission } from '@pkg/database';

import { UpdateRolePermissionsAsserter, UpdateRolePermissionsCommand } from './update-role-permissions.helpers';

/**
 * 역할 권한 매핑 업데이트 핸들러
 */
@CommandHandler(UpdateRolePermissionsCommand)
export class UpdateRolePermissionsHandler implements ICommandHandler<UpdateRolePermissionsCommand> {
  private readonly Asserter = UpdateRolePermissionsAsserter;

  constructor(private readonly em: EntityManager) {}

  @Transactional()
  async execute(command: UpdateRolePermissionsCommand): Promise<boolean> {
    await this.validateRoleCode(command.roleCode);
    const { role, permissions } = await this.identifyRoleAndPermissions(command.roleCode, command.permissionCodes);
    return this.processMappingUpdate(role, permissions);
  }

  private async identifyRoleAndPermissions(
    roleCode: string,
    permissionCodes: string[],
  ): Promise<{ role: Role, permissions: Permission[] }> {
    const role = await this.Asserter.assert(
      this.em.findOne(Role, { code: roleCode }),
      'ROLE_NOT_FOUND',
    );

    const permissions = permissionCodes.length > 0
      ? await this.em.find(Permission, { code: { $in: permissionCodes } })
      : [];

    return { role, permissions };
  }

  private async validateRoleCode(roleCode: string): Promise<void> {
    await this.Asserter.throwIf(!roleCode, 'INVALID_ROLE_CODE');
  }

  private async processMappingUpdate(role: Role, newPermissions: Permission[]): Promise<boolean> {
    // 1. 기존 매핑 데이터 로드
    const existingMappings = await this.em.find(RolePermission, { role }, { populate: ['permission'] });

    const existingPermCodes = new Set(existingMappings.map((m) => m.permission.code));
    const targetPermCodes = new Set(newPermissions.map((p) => p.code));

    // 2. 삭제할 매핑 계산
    const toRemove = existingMappings.filter((m) => !targetPermCodes.has(m.permission.code));

    // 3. 추가할 권한 계산
    const toAdd = newPermissions.filter((p) => !existingPermCodes.has(p.code));

    // 4. 삭제 수행
    for (const mapping of toRemove) {
      this.em.remove(mapping);
    }

    // 5. 추가 수행
    for (const permission of toAdd) {
      const newMapping = new RolePermission();
      newMapping.role = role;
      newMapping.permission = permission;
      this.em.persist(newMapping);
    }

    return true;
  }
}
