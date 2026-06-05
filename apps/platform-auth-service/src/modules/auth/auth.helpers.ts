import type { Member, OrganizationRole } from '@pkg/database';

/**
 * Populate된 Member 엔티티에서 유효 역할 및 권한 목록을 추출합니다.
 */
export function extractPermissions(
  member: Member,
  organizationId?: string,
): { permissions: string[] } {
  if (!organizationId) {
    return {
      permissions: [],
    };
  }

  const permissions = new Set<string>();
  const organizationRoles = member.organizationRoles.getItems();

  for (const organizationRole of organizationRoles) {
    // 1. 조직 필터링
    if (organizationRole.organization.id !== organizationId) {
      continue;
    }

    // 2. 권한 코드 추출 (중첩 제거를 위해 헬퍼 사용)
    collectRolePermissions(organizationRole.role, permissions);
  }

  return {
    permissions: Array.from(permissions),
  };
}

/**
 * 조직 역할에서 권한 코드를 추출하여 Set에 추가합니다.
 * (인지 복잡도 감소를 위한 내부 헬퍼)
 */
function collectRolePermissions(role: OrganizationRole, permissions: Set<string>): void {
  for (const rp of role.permissions.getItems()) {
    permissions.add(`${rp.resource.code}:${rp.action}`);
  }
}
