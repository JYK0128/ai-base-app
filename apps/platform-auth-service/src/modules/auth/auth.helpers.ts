import type { Manager, Role } from '@pkg/database';

/**
 * Populate된 Manager 엔티티에서 유효 역할 및 권한 목록을 추출합니다.
 */
export function extractPermissions(
  manager: Manager,
  organizationId?: string,
): { roles: string[], permissions: string[] } {
  const roles = new Set<string>();
  const permissions = new Set<string>();

  if (!manager.roles) return { roles: [], permissions: [] };

  for (const mr of manager.roles) {
    // 1. 조직 필터링
    if (organizationId && mr.organization && mr.organization.id !== organizationId) {
      continue;
    }

    // 2. 역할 코드 추가
    const role = mr.role;
    if (!role) continue;
    roles.add(role.code);

    // 3. 권한 코드 추출 (중첩 제거를 위해 헬퍼 사용)
    collectRolePermissions(role, permissions);
  }

  return {
    roles: Array.from(roles),
    permissions: Array.from(permissions),
  };
}

/**
 * 역할(Role)에서 권한 코드를 추출하여 Set에 추가합니다.
 * (인지 복잡도 감소를 위한 내부 헬퍼)
 */
function collectRolePermissions(role: Role, permissions: Set<string>): void {
  if (!role.permissions) return;

  for (const rp of role.permissions) {
    if (rp.resource?.code && rp.action) {
      permissions.add(`${rp.resource.code}:${rp.action}`);
    }
  }
}
