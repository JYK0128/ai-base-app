const ROLE_PERMISSION_MAP = {
  PLATFORM_ADMIN: {
    role: 'platform_admin',
    permissions: ['platform.manage', 'organization.manage', 'message.manage'],
  },
  PLATFORM_STAFF: {
    role: 'platform_staff',
    permissions: ['message.manage'],
  },
  ORGANIZATION_ADMIN: {
    role: 'organization_admin',
    permissions: ['organization.manage'],
  },
  ORGANIZATION_STAFF: {
    role: 'organization_staff',
    permissions: [],
  },
} as const;

export type ManagerPermissionSource = {
  organization?: { id: string } | null
  role: string
};

export function resolveManagerPermissionSet(
  managers: ManagerPermissionSource[],
  tenantId?: string,
) {
  const roles = new Set<string>();
  const permissions = new Set<string>();

  for (const manager of managers) {
    if (tenantId && manager.organization?.id !== tenantId) {
      continue;
    }

    const fallback = ROLE_PERMISSION_MAP[manager.role as keyof typeof ROLE_PERMISSION_MAP];
    if (!fallback) {
      continue;
    }

    roles.add(fallback.role);
    for (const permissionCode of fallback.permissions) {
      permissions.add(permissionCode);
    }
  }

  return {
    roles: [...roles],
    permissions: [...permissions],
  };
}
