import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';

import { RbacRoleScope, Role } from '@/domains/rbac/rbac.entity';
import { ManagerRole } from '@/domains/rbac/rbac.manager-role.entity';
import { RolePermission } from '@/domains/rbac/rbac.role-permission.entity';

export interface RoleRecord {
  id: string
  code: string
  name: string
  scope: RbacRoleScope
  description?: string
}

export interface CreateRoleInput {
  code: string
  name: string
  scope?: RbacRoleScope
  description?: string
  actorId?: string
}

export interface UpdateRoleInput {
  id: string
  name?: string
  description?: string
  actorId?: string
}

const toRoleRecord = (row: Role): RoleRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  scope: row.scope,
  ...(row.description ? { description: row.description } : {}),
});

export class RbacRoleRepository {
  constructor(private readonly em: EntityManager) {}

  async listRoles(): Promise<RoleRecord[]> {
    const rows = await this.em.find(Role, {});
    return rows.map(toRoleRecord);
  }

  async createRole(input: CreateRoleInput): Promise<RoleRecord> {
    const created = this.em.create(Role, {
      id: randomUUID(),
      code: input.code,
      name: input.name,
      scope: input.scope ?? RbacRoleScope.PLATFORM,
      ...(input.description ? { description: input.description } : {}),
      ...(input.actorId ? { createdBy: input.actorId, updatedBy: input.actorId } : {}),
    });

    this.em.persist(created);
    await this.em.flush();
    return toRoleRecord(created);
  }

  async updateRole(input: UpdateRoleInput): Promise<RoleRecord> {
    const found = await this.em.findOne(Role, { id: input.id });
    if (!found) {
      throw new Error(`RBAC Role을 찾을 수 없습니다. (id=${input.id})`);
    }

    if (input.name !== undefined) {
      found.name = input.name;
    }
    if (input.description !== undefined) {
      found.description = input.description;
    }
    if (input.actorId) {
      found.updatedBy = input.actorId;
    }

    await this.em.flush();
    return toRoleRecord(found);
  }

  async deleteRole(params: { id: string, actorId?: string }): Promise<void> {
    const found = await this.em.findOne(Role, { id: params.id });
    if (!found) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;

    const managerRoles = await this.em.find(ManagerRole, { role: params.id });
    for (const managerRole of managerRoles) {
      managerRole.deletedAt = new Date();
      managerRole.deletedBy = params.actorId ?? null;
      managerRole.updatedBy = params.actorId;
    }

    const rolePermissions = await this.em.find(RolePermission, { role: params.id });
    for (const rolePermission of rolePermissions) {
      rolePermission.deletedAt = new Date();
      rolePermission.deletedBy = params.actorId ?? null;
      rolePermission.updatedBy = params.actorId;
    }

    await this.em.flush();
  }

  async assignPermissionToRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RolePermission, {
      role: params.roleId,
      permission: params.permissionId,
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

    const created = this.em.create(RolePermission, {
      id: randomUUID(),
      role: params.roleId,
      permission: params.permissionId,
      ...(params.actorId ? { createdBy: params.actorId, updatedBy: params.actorId } : {}),
    });

    this.em.persist(created);
    await this.em.flush();
  }

  async revokePermissionFromRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RolePermission, {
      role: params.roleId,
      permission: params.permissionId,
    });

    if (!found || found.deletedAt) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;
    await this.em.flush();
  }
}

export const createRbacRoleRepository = (em: EntityManager): RbacRoleRepository => (
  new RbacRoleRepository(em)
);
