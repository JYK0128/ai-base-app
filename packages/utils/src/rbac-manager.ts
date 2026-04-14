export interface RbacRoleRecord {
  id: string;
  code: string;
  name: string;
  scope: 'PLATFORM' | 'TENANT';
  description?: string;
}

export interface RbacPermissionRecord {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface CreateRbacRoleInput {
  code: string;
  name: string;
  scope?: 'PLATFORM' | 'TENANT';
  description?: string;
  actorId?: string;
}

export interface UpdateRbacRoleInput {
  id: string;
  name?: string;
  description?: string;
  actorId?: string;
}

export interface CreateRbacPermissionInput {
  code: string;
  name: string;
  description?: string;
  actorId?: string;
}

export interface UpdateRbacPermissionInput {
  id: string;
  name?: string;
  description?: string;
  actorId?: string;
}

export interface RbacStore {
  listRoles(): Promise<RbacRoleRecord[]>;
  listPermissions(): Promise<RbacPermissionRecord[]>;
  createRole(input: CreateRbacRoleInput): Promise<RbacRoleRecord>;
  updateRole(input: UpdateRbacRoleInput): Promise<RbacRoleRecord>;
  deleteRole(params: { id: string; actorId?: string }): Promise<void>;
  createPermission(input: CreateRbacPermissionInput): Promise<RbacPermissionRecord>;
  updatePermission(input: UpdateRbacPermissionInput): Promise<RbacPermissionRecord>;
  deletePermission(params: { id: string; actorId?: string }): Promise<void>;
  assignPermissionToRole(params: { roleId: string; permissionId: string; actorId?: string }): Promise<void>;
  revokePermissionFromRole(params: { roleId: string; permissionId: string; actorId?: string }): Promise<void>;
  assignRoleToUser(params: { userId: string; roleId: string; tenantId?: string; actorId?: string }): Promise<void>;
  revokeRoleFromUser(params: { userId: string; roleId: string; tenantId?: string; actorId?: string }): Promise<void>;
  getPermissionCodesByUser(params: { userId: string; tenantId?: string }): Promise<string[]>;
}

interface RbacCache {
  roles: Map<string, RbacRoleRecord>;
  permissions: Map<string, RbacPermissionRecord>;
  userPermissions: Map<string, Set<string>>;
}

const makeUserPermissionKey = (userId: string, tenantId?: string): string => `${userId}::${tenantId ?? ''}`;

export class RbacService {
  private readonly cache: RbacCache = {
    roles: new Map(),
    permissions: new Map(),
    userPermissions: new Map(),
  };

  constructor(private readonly store: RbacStore) {}

  async syncFromDatabase(): Promise<void> {
    const [roles, permissions] = await Promise.all([
      this.store.listRoles(),
      this.store.listPermissions(),
    ]);

    this.cache.roles = new Map(roles.map((role) => [role.id, role]));
    this.cache.permissions = new Map(permissions.map((permission) => [permission.id, permission]));
    this.cache.userPermissions.clear();
  }

  getRoles(): RbacRoleRecord[] {
    return [...this.cache.roles.values()];
  }

  getPermissions(): RbacPermissionRecord[] {
    return [...this.cache.permissions.values()];
  }

  async createRole(input: CreateRbacRoleInput): Promise<RbacRoleRecord> {
    const created = await this.store.createRole(input);
    this.cache.roles.set(created.id, created);
    return created;
  }

  async updateRole(input: UpdateRbacRoleInput): Promise<RbacRoleRecord> {
    const updated = await this.store.updateRole(input);
    this.cache.roles.set(updated.id, updated);
    this.cache.userPermissions.clear();
    return updated;
  }

  async deleteRole(params: { id: string; actorId?: string }): Promise<void> {
    await this.store.deleteRole(params);
    this.cache.roles.delete(params.id);
    this.cache.userPermissions.clear();
  }

  async createPermission(input: CreateRbacPermissionInput): Promise<RbacPermissionRecord> {
    const created = await this.store.createPermission(input);
    this.cache.permissions.set(created.id, created);
    return created;
  }

  async updatePermission(input: UpdateRbacPermissionInput): Promise<RbacPermissionRecord> {
    const updated = await this.store.updatePermission(input);
    this.cache.permissions.set(updated.id, updated);
    this.cache.userPermissions.clear();
    return updated;
  }

  async deletePermission(params: { id: string; actorId?: string }): Promise<void> {
    await this.store.deletePermission(params);
    this.cache.permissions.delete(params.id);
    this.cache.userPermissions.clear();
  }

  async assignPermissionToRole(params: { roleId: string; permissionId: string; actorId?: string }): Promise<void> {
    await this.store.assignPermissionToRole(params);
    this.cache.userPermissions.clear();
  }

  async revokePermissionFromRole(params: { roleId: string; permissionId: string; actorId?: string }): Promise<void> {
    await this.store.revokePermissionFromRole(params);
    this.cache.userPermissions.clear();
  }

  async assignRoleToUser(params: { userId: string; roleId: string; tenantId?: string; actorId?: string }): Promise<void> {
    await this.store.assignRoleToUser(params);
    this.cache.userPermissions.delete(makeUserPermissionKey(params.userId, params.tenantId));
  }

  async revokeRoleFromUser(params: { userId: string; roleId: string; tenantId?: string; actorId?: string }): Promise<void> {
    await this.store.revokeRoleFromUser(params);
    this.cache.userPermissions.delete(makeUserPermissionKey(params.userId, params.tenantId));
  }

  async hasPermission(params: { userId: string; permissionCode: string; tenantId?: string }): Promise<boolean> {
    const userPermissionKey = makeUserPermissionKey(params.userId, params.tenantId);
    const cached = this.cache.userPermissions.get(userPermissionKey);

    if (cached) {
      return cached.has(params.permissionCode);
    }

    const permissionCodes = await this.store.getPermissionCodesByUser({
      userId: params.userId,
      tenantId: params.tenantId,
    });
    this.cache.userPermissions.set(userPermissionKey, new Set(permissionCodes));

    return permissionCodes.includes(params.permissionCode);
  }
}

export const createRbacService = (store: RbacStore): RbacService => (
  new RbacService(store)
);
