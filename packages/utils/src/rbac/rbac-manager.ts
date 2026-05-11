import { CollectionHelper } from '../core/collection-helper';
import { KeyHelper } from '../core/key-helper';
import type { CreateRbacPermissionInput, CreateRbacRoleInput, RbacCache, RbacPermissionRecord, RbacRoleRecord, RbacStore, UpdateRbacPermissionInput, UpdateRbacRoleInput } from './rbac-manager.types';

/**
 * RBAC 비즈니스 로직 및 권한 검증 서비스
 */
export class RbacService {
  /** 고성능 검증을 위한 내부 캐시 */
  private readonly cache: RbacCache = {
    roles: new Map(),
    permissions: new Map(),
    userPermissions: new Map(),
  };

  constructor(private readonly store: RbacStore) {}

  /**
   * 데이터베이스로부터 최신 보안 정책(역할, 권한)을 동기화합니다.
   * 정책이 변경되면 기존의 사용자별 권한 캐시는 모두 무효화됩니다.
   */
  async syncFromDatabase(): Promise<void> {
    const [roles, permissions] = await Promise.all([
      this.store.listRoles(),
      this.store.listPermissions(),
    ]);

    this.cache.roles = CollectionHelper.toMap(roles, (r) => r.id);
    this.cache.permissions = CollectionHelper.toMap(permissions, (p) => p.id);
    this.cache.userPermissions.clear();
  }

  /** 가용 역할 목록 조회 */
  getRoles(): RbacRoleRecord[] {
    return [...this.cache.roles.values()];
  }

  /** 가용 권한 목록 조회 */
  getPermissions(): RbacPermissionRecord[] {
    return [...this.cache.permissions.values()];
  }

  /** 새 역할 생성 및 캐시 반영 */
  async createRole(input: CreateRbacRoleInput): Promise<RbacRoleRecord> {
    const created = await this.store.createRole(input);
    this.cache.roles.set(created.id, created);
    return created;
  }

  /** 역할 수정 및 관련 사용자 권한 캐시 초기화 */
  async updateRole(input: UpdateRbacRoleInput): Promise<RbacRoleRecord> {
    const updated = await this.store.updateRole(input);
    this.cache.roles.set(updated.id, updated);
    this.cache.userPermissions.clear();
    return updated;
  }

  /** 역할 삭제 및 관련 사용자 권한 캐시 초기화 */
  async deleteRole(params: { id: string, actorId?: string }): Promise<void> {
    await this.store.deleteRole(params);
    this.cache.roles.delete(params.id);
    this.cache.userPermissions.clear();
  }

  /** 새 권한 생성 및 캐시 반영 */
  async createPermission(input: CreateRbacPermissionInput): Promise<RbacPermissionRecord> {
    const created = await this.store.createPermission(input);
    this.cache.permissions.set(created.id, created);
    return created;
  }

  /** 권한 수정 및 캐시 무효화 */
  async updatePermission(input: UpdateRbacPermissionInput): Promise<RbacPermissionRecord> {
    const updated = await this.store.updatePermission(input);
    this.cache.permissions.set(updated.id, updated);
    this.cache.userPermissions.clear();
    return updated;
  }

  /** 권한 삭제 및 캐시 무효화 */
  async deletePermission(params: { id: string, actorId?: string }): Promise<void> {
    await this.store.deletePermission(params);
    this.cache.permissions.delete(params.id);
    this.cache.userPermissions.clear();
  }

  /** 역할에 권한을 할당하고 캐시를 무효화합니다. */
  async assignPermissionToRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void> {
    await this.store.assignPermissionToRole(params);
    this.cache.userPermissions.clear();
  }

  /** 역할에서 권한을 철회하고 캐시를 무효화합니다. */
  async revokePermissionFromRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void> {
    await this.store.revokePermissionFromRole(params);
    this.cache.userPermissions.clear();
  }

  /** 사용자에게 역할을 할당하고 해당 사용자의 캐시를 삭제합니다. */
  async assignRoleToUser(params: { userId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void> {
    await this.store.assignRoleToUser(params);
    this.cache.userPermissions.delete(KeyHelper.join(params.userId, params.organizationId));
  }

  /** 사용자로부터 역할을 철회하고 해당 사용자의 캐시를 삭제합니다. */
  async revokeRoleFromUser(params: { userId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void> {
    await this.store.revokeRoleFromUser(params);
    this.cache.userPermissions.delete(KeyHelper.join(params.userId, params.organizationId));
  }

  /**
   * 사용자가 특정 권한을 가지고 있는지 확인합니다 (캐시 지원).
   * @param params 사용자 ID, 확인할 권한 코드, 워크스페이스 ID
   * @returns 권한 보유 여부
   */
  async hasPermission(params: { userId: string, permissionCode: string, organizationId?: string }): Promise<boolean> {
    const userPermissionKey = KeyHelper.join(params.userId, params.organizationId);
    const cached = this.cache.userPermissions.get(userPermissionKey);

    if (cached) {
      return cached.has(params.permissionCode);
    }

    // 캐시 미스 시 DB에서 로드하여 캐싱 (Lazy Loading)
    const permissionCodes = await this.store.getPermissionCodesByUser({
      userId: params.userId,
      organizationId: params.organizationId,
    });
    this.cache.userPermissions.set(userPermissionKey, new Set(permissionCodes));

    return permissionCodes.includes(params.permissionCode);
  }
}

/**
 * RBAC 서비스 팩토리
 */
export const createRbacService = (store: RbacStore): RbacService => (
  new RbacService(store)
);
