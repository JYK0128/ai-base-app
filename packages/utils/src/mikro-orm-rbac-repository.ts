import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import {
  RbacPermission,
  RbacRole,
  RbacRolePermission,
  RbacRoleScope,
  RbacUserRole,
} from '@pkg/database';

import type {
  CreateRbacPermissionInput,
  CreateRbacRoleInput,
  RbacPermissionRecord,
  RbacRepository,
  RbacRoleRecord,
  UpdateRbacPermissionInput,
  UpdateRbacRoleInput,
} from './rbac-manager';

const toRoleRecord = (row: RbacRole): RbacRoleRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  scope: row.scope,
  ...(row.description ? { description: row.description } : {}),
});

const toPermissionRecord = (row: RbacPermission): RbacPermissionRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  ...(row.description ? { description: row.description } : {}),
});

export class MikroOrmRbacRepository implements RbacRepository {
  constructor(private readonly em: EntityManager) {}

  async listRoles(): Promise<RbacRoleRecord[]> {
    const rows = await this.em.find(RbacRole, {});
    return rows.map(toRoleRecord);
  }

  async listPermissions(): Promise<RbacPermissionRecord[]> {
    const rows = await this.em.find(RbacPermission, {});
    return rows.map(toPermissionRecord);
  }

  async createRole(input: CreateRbacRoleInput): Promise<RbacRoleRecord> {
    const created = this.em.create(RbacRole, {
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

  async updateRole(input: UpdateRbacRoleInput): Promise<RbacRoleRecord> {
    const found = await this.em.findOne(RbacRole, { id: input.id });
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

  async deleteRole(params: { id: string; actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RbacRole, { id: params.id });
    if (!found) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;

    const userRoles = await this.em.find(RbacUserRole, { roleId: params.id });
    for (const userRole of userRoles) {
      userRole.deletedAt = new Date();
      userRole.deletedBy = params.actorId ?? null;
      userRole.updatedBy = params.actorId;
    }

    const rolePermissions = await this.em.find(RbacRolePermission, { roleId: params.id });
    for (const rolePermission of rolePermissions) {
      rolePermission.deletedAt = new Date();
      rolePermission.deletedBy = params.actorId ?? null;
      rolePermission.updatedBy = params.actorId;
    }

    await this.em.flush();
  }

  async createPermission(input: CreateRbacPermissionInput): Promise<RbacPermissionRecord> {
    const created = this.em.create(RbacPermission, {
      id: randomUUID(),
      code: input.code,
      name: input.name,
      ...(input.description ? { description: input.description } : {}),
      ...(input.actorId ? { createdBy: input.actorId, updatedBy: input.actorId } : {}),
    });

    this.em.persist(created);
    await this.em.flush();

    return toPermissionRecord(created);
  }

  async updatePermission(input: UpdateRbacPermissionInput): Promise<RbacPermissionRecord> {
    const found = await this.em.findOne(RbacPermission, { id: input.id });
    if (!found) {
      throw new Error(`RBAC Permission을 찾을 수 없습니다. (id=${input.id})`);
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
    return toPermissionRecord(found);
  }

  async deletePermission(params: { id: string; actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RbacPermission, { id: params.id });
    if (!found) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;

    const rolePermissions = await this.em.find(RbacRolePermission, { permissionId: params.id });
    for (const rolePermission of rolePermissions) {
      rolePermission.deletedAt = new Date();
      rolePermission.deletedBy = params.actorId ?? null;
      rolePermission.updatedBy = params.actorId;
    }

    await this.em.flush();
  }

  async assignPermissionToRole(params: { roleId: string; permissionId: string; actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RbacRolePermission, {
      roleId: params.roleId,
      permissionId: params.permissionId,
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

    const created = this.em.create(RbacRolePermission, {
      id: randomUUID(),
      roleId: params.roleId,
      permissionId: params.permissionId,
      ...(params.actorId ? { createdBy: params.actorId, updatedBy: params.actorId } : {}),
    });

    this.em.persist(created);
    await this.em.flush();
  }

  async revokePermissionFromRole(params: { roleId: string; permissionId: string; actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RbacRolePermission, {
      roleId: params.roleId,
      permissionId: params.permissionId,
    });

    if (!found || found.deletedAt) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;
    await this.em.flush();
  }

  async assignRoleToUser(params: { userId: string; roleId: string; tenantId?: string; actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RbacUserRole, {
      userId: params.userId,
      roleId: params.roleId,
      tenantId: params.tenantId,
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

    const created = this.em.create(RbacUserRole, {
      id: randomUUID(),
      userId: params.userId,
      roleId: params.roleId,
      ...(params.tenantId ? { tenantId: params.tenantId } : {}),
      ...(params.actorId ? { createdBy: params.actorId, updatedBy: params.actorId } : {}),
    });

    this.em.persist(created);
    await this.em.flush();
  }

  async revokeRoleFromUser(params: { userId: string; roleId: string; tenantId?: string; actorId?: string }): Promise<void> {
    const found = await this.em.findOne(RbacUserRole, {
      userId: params.userId,
      roleId: params.roleId,
      tenantId: params.tenantId,
    });

    if (!found || found.deletedAt) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;
    await this.em.flush();
  }

  async getPermissionCodesByUser(params: { userId: string; tenantId?: string }): Promise<string[]> {
    const userRoles = await this.em.find(RbacUserRole, {
      userId: params.userId,
      ...(params.tenantId !== undefined ? { tenantId: params.tenantId } : {}),
    });
    if (!userRoles.length) {
      return [];
    }

    const roleIds = [...new Set(userRoles.map((row) => row.roleId))];
    const rolePermissions = await this.em.find(RbacRolePermission, { roleId: { $in: roleIds } });
    if (!rolePermissions.length) {
      return [];
    }

    const permissionIds = [...new Set(rolePermissions.map((row) => row.permissionId))];
    const permissions = await this.em.find(RbacPermission, { id: { $in: permissionIds } });

    return [...new Set(permissions.map((permission) => permission.code))];
  }
}

export const createMikroOrmRbacRepository = (em: EntityManager): MikroOrmRbacRepository => (
  new MikroOrmRbacRepository(em)
);
