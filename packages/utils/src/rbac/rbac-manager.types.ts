/**
 * RBAC(역할 기반 권한 제어) 관련 인터페이스 및 타입 정의
 */

/** 시스템 내 역할(Role) 정보 레코드 */
export interface RbacRoleRecord {
  id: string
  code: string
  name: string
  /** 역할의 범위: 플랫폼 전체(PLATFORM) 또는 특정 조직(ORGANIZATION) */
  scope: 'PLATFORM' | 'ORGANIZATION'
  description?: string
}

/** 시스템 내 권한(Permission) 정보 레코드 */
export interface RbacPermissionRecord {
  id: string
  /** 권한 코드 (예: 'user.create', 'order.view') */
  code: string
  name: string
  description?: string
}

/**
 * RBAC 인메모리 캐시 구조
 */
export interface RbacCache {
  /** 역할 ID별 레코드 맵 */
  roles: Map<string, RbacRoleRecord>
  /** 권한 ID별 레코드 맵 */
  permissions: Map<string, RbacPermissionRecord>
  /** 사용자별 권한 코드 Set (복합키: userId::organizationId) */
  userPermissions: Map<string, Set<string>>
}

/** 역할 생성을 위한 입력 데이터 */
export interface CreateRbacRoleInput {
  code: string
  name: string
  scope?: 'PLATFORM' | 'ORGANIZATION'
  description?: string
  /** 작업을 수행하는 사용자 ID (감사 로그용) */
  actorId?: string
}

/** 역할 수정을 위한 입력 데이터 */
export interface UpdateRbacRoleInput {
  id: string
  name?: string
  description?: string
  actorId?: string
}

/** 권한 생성을 위한 입력 데이터 */
export interface CreateRbacPermissionInput {
  code: string
  name: string
  description?: string
  actorId?: string
}

/** 권한 수정을 위한 입력 데이터 */
export interface UpdateRbacPermissionInput {
  id: string
  name?: string
  description?: string
  actorId?: string
}

/** RBAC 영속성 계층을 위한 인터페이스 */
export interface RbacStore {
  listRoles(): Promise<RbacRoleRecord[]>
  listPermissions(): Promise<RbacPermissionRecord[]>
  createRole(input: CreateRbacRoleInput): Promise<RbacRoleRecord>
  updateRole(input: UpdateRbacRoleInput): Promise<RbacRoleRecord>
  deleteRole(params: { id: string, actorId?: string }): Promise<void>
  createPermission(input: CreateRbacPermissionInput): Promise<RbacPermissionRecord>
  updatePermission(input: UpdateRbacPermissionInput): Promise<RbacPermissionRecord>
  deletePermission(params: { id: string, actorId?: string }): Promise<void>

  /** 역할에 권한 할당 */
  assignPermissionToRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void>
  /** 역할에서 권한 제거 */
  revokePermissionFromRole(params: { roleId: string, permissionId: string, actorId?: string }): Promise<void>

  /** 사용자에게 역할 할당 (조직 범위 지정 가능) */
  assignRoleToUser(params: { userId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void>
  /** 사용자로부터 역할 제거 */
  revokeRoleFromUser(params: { userId: string, roleId: string, organizationId?: string, actorId?: string }): Promise<void>

  /** 사용자가 가진 모든 권한 코드 목록 조회 */
  getPermissionCodesByUser(params: { userId: string, organizationId?: string }): Promise<string[]>
}
