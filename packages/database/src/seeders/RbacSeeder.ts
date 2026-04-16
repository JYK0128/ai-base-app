import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Permission } from '@/domains/platform/rbac/permission.entity';
import { RbacRoleScope, Role } from '@/domains/platform/rbac/role.entity';
import { RolePermission } from '@/domains/platform/rbac/role.permission.entity';

const roleSeeds = [
  {
    code: 'platform_admin',
    name: 'Platform Admin',
    scope: RbacRoleScope.PLATFORM,
    description: 'Platform-wide administrator role',
  },
  {
    code: 'platform_staff',
    name: 'Platform Staff',
    scope: RbacRoleScope.PLATFORM,
    description: 'Platform operations role',
  },
  {
    code: 'organization_admin',
    name: 'Organization Admin',
    scope: RbacRoleScope.ORGANIZATION,
    description: 'Organization administrator role',
  },
] as const;

const permissionSeeds = [
  {
    code: 'platform.manage',
    name: 'Manage Platform',
    description: 'Manage platform configuration and members',
  },
  {
    code: 'organization.manage',
    name: 'Manage Organization',
    description: 'Manage organization settings and members',
  },
  {
    code: 'message.manage',
    name: 'Manage Messages',
    description: 'Manage i18n message records',
  },
] as const;

const rolePermissionMap: Record<string, string[]> = {
  platform_admin: ['platform.manage', 'organization.manage', 'message.manage'],
  platform_staff: ['message.manage'],
  organization_admin: ['organization.manage'],
};

export class RbacSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const roles = await this.seedRoles(em);
    const permissions = await this.seedPermissions(em);

    await this.seedRolePermissions(em, roles, permissions);

    await em.flush();
  }

  private async seedRoles(em: EntityManager): Promise<Map<string, Role>> {
    const roles = new Map<string, Role>();

    for (const roleSeed of roleSeeds) {
      const role = await this.upsertRole(em, roleSeed);
      roles.set(roleSeed.code, role);
    }

    return roles;
  }

  private async seedPermissions(em: EntityManager): Promise<Map<string, Permission>> {
    const permissions = new Map<string, Permission>();

    for (const permissionSeed of permissionSeeds) {
      const permission = await this.upsertPermission(em, permissionSeed);
      permissions.set(permissionSeed.code, permission);
    }

    return permissions;
  }

  private async seedRolePermissions(
    em: EntityManager,
    roles: Map<string, Role>,
    permissions: Map<string, Permission>,
  ): Promise<void> {
    for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
      const role = roles.get(roleCode);

      if (!role) {
        continue;
      }

      for (const permissionCode of permissionCodes) {
        const permission = permissions.get(permissionCode);

        if (!permission) {
          continue;
        }

        await this.createRolePermissionLink(em, role, permission);
      }
    }
  }

  private async upsertRole(
    em: EntityManager,
    roleSeed: (typeof roleSeeds)[number],
  ): Promise<Role> {
    const found = await em.findOne(Role, { code: roleSeed.code });

    if (found) {
      found.name = roleSeed.name;
      found.scope = roleSeed.scope;
      found.description = roleSeed.description;
      return found;
    }

    const created = em.create(Role, {
      id: randomUUID(),
      ...roleSeed,
    });
    em.persist(created);
    return created;
  }

  private async upsertPermission(
    em: EntityManager,
    permissionSeed: (typeof permissionSeeds)[number],
  ): Promise<Permission> {
    const found = await em.findOne(Permission, { code: permissionSeed.code });

    if (found) {
      found.name = permissionSeed.name;
      found.description = permissionSeed.description;
      return found;
    }

    const created = em.create(Permission, {
      id: randomUUID(),
      ...permissionSeed,
    });
    em.persist(created);
    return created;
  }

  private async createRolePermissionLink(
    em: EntityManager,
    role: Role,
    permission: Permission,
  ): Promise<void> {
    const found = await em.findOne(RolePermission, {
      role: role.id,
      permission: permission.id,
    });

    if (found) {
      return;
    }

    em.persist(em.create(RolePermission, {
      id: randomUUID(),
      role,
      permission,
    }));
  }
}
