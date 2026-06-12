import type { Member, OrganizationRole } from '@pkg/database';

/**
 * Member 엔티티에서 유효 역할 및 권한 목록을 추출합니다.
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
    if (organizationRole.organization.id !== organizationId) {
      continue;
    }

    collectRolePermissions(organizationRole.role, permissions);
  }

  return {
    permissions: Array.from(permissions),
  };
}

function collectRolePermissions(role: OrganizationRole, permissions: Set<string>): void {
  for (const rp of role.permissions.getItems()) {
    permissions.add(`${rp.resource.code}:${rp.action}`);
  }
}
