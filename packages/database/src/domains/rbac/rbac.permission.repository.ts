import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';

import { Permission } from '@/domains/rbac/rbac.permission.entity';
import { RolePermission } from '@/domains/rbac/rbac.role-permission.entity';

export interface PermissionRecord {
  id: string
  code: string
  name: string
  description?: string
}

export interface CreatePermissionInput {
  code: string
  name: string
  description?: string
  actorId?: string
}

export interface UpdatePermissionInput {
  id: string
  name?: string
  description?: string
  actorId?: string
}

const toPermissionRecord = (row: Permission): PermissionRecord => ({
  id: row.id,
  code: row.code,
  name: row.name,
  ...(row.description ? { description: row.description } : {}),
});

export class RbacPermissionRepository {
  constructor(private readonly em: EntityManager) {}

  async listPermissions(): Promise<PermissionRecord[]> {
    const rows = await this.em.find(Permission, {});
    return rows.map(toPermissionRecord);
  }

  async createPermission(input: CreatePermissionInput): Promise<PermissionRecord> {
    const created = this.em.create(Permission, {
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

  async updatePermission(input: UpdatePermissionInput): Promise<PermissionRecord> {
    const found = await this.em.findOne(Permission, { id: input.id });
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

  async deletePermission(params: { id: string, actorId?: string }): Promise<void> {
    const found = await this.em.findOne(Permission, { id: params.id });
    if (!found) {
      return;
    }

    found.deletedAt = new Date();
    found.deletedBy = params.actorId ?? null;
    found.updatedBy = params.actorId;

    const rolePermissions = await this.em.find(RolePermission, { permission: params.id });
    for (const rolePermission of rolePermissions) {
      rolePermission.deletedAt = new Date();
      rolePermission.deletedBy = params.actorId ?? null;
      rolePermission.updatedBy = params.actorId;
    }

    await this.em.flush();
  }
}

export const createRbacPermissionRepository = (em: EntityManager): RbacPermissionRepository => (
  new RbacPermissionRepository(em)
);
