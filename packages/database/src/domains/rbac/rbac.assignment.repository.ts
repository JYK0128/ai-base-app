import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';

import { ManagerRole } from '@/domains/rbac/rbac.manager-role.entity';
import { Permission } from '@/domains/rbac/rbac.permission.entity';
import { RolePermission } from '@/domains/rbac/rbac.role-permission.entity';

export class RbacAssignmentRepository {
  constructor(private readonly em: EntityManager) {}

  async assignRoleToManager(params: { managerId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void> {
    const found = await this.em.findOne(ManagerRole, {
      managerId: params.managerId,
      role: params.roleId,
      ...(params.organizationId !== undefined ? { organization: params.organizationId } : { organization: null }),
    });

    if (found) {
      if (found.deletedAt) {
        found.deletedAt = null;
        found.deletedBy = null;
      }
      found.updatedBy = params.actorId;
      await this.em.flush();
      return;
    }

    const created = this.em.create(ManagerRole, {
      id: randomUUID(),
      managerId: params.managerId,
      role: params.roleId,
      ...(params.organizationId ? { organization: params.organizationId } : {}),
      ...(params.actorId ? { createdBy: params.actorId, updatedBy: params.actorId } : {}),
    });

    this.em.persist(created);
    await this.em.flush();
  }

  async revokeRoleFromManager(params: { managerId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void> {
    const found = await this.em.findOne(ManagerRole, {
      managerId: params.managerId,
      role: params.roleId,
      ...(params.organizationId !== undefined ? { organization: params.organizationId } : { organization: null }),
    });

    if (!found || found.deletedAt) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;
    await this.em.flush();
  }

  async getPermissionCodesByManager(params: { managerId: string, organizationId?: string }): Promise<string[]> {
    const managerRoles = await this.em.find(ManagerRole, {
      managerId: params.managerId,
      ...(params.organizationId !== undefined ? { organization: params.organizationId } : {}),
    });
    if (!managerRoles.length) {
      return [];
    }

    const roleIds = [...new Set(managerRoles.map((row) => row.role.id))];
    const rolePermissions = await this.em.find(RolePermission, { role: { $in: roleIds } });
    if (!rolePermissions.length) {
      return [];
    }

    const permissionIds = [...new Set(rolePermissions.map((row) => row.permission.id))];
    const permissions = await this.em.find(Permission, { id: { $in: permissionIds } });
    return [...new Set(permissions.map((permission) => permission.code))];
  }
}

export const createRbacAssignmentRepository = (em: EntityManager): RbacAssignmentRepository => (
  new RbacAssignmentRepository(em)
);
