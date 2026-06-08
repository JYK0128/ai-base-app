import { type OrganizationRole } from '@pkg/database';

export interface PermissionSetRecord {
  id: string
  code: string
  name: string
  description: string
  assignmentCount: number
  permissionCodes: string[]
}

export function buildPermissionCode(resourceCode: string, action: string): string {
  return `${resourceCode}:${action}`;
}

export function normalizePermissionCodes(codes: readonly string[]): string[] {
  return Array.from(new Set(codes)).sort((a, b) => a.localeCompare(b));
}

export function normalizeRoleCode(code: string): string {
  return code.toUpperCase().replace(/\s+/g, '_');
}

export function buildPermissionSetRecord(role: OrganizationRole): PermissionSetRecord {
  const permissionCodes = normalizePermissionCodes(
    role.permissions.getItems().map((permission) => buildPermissionCode(permission.resource.code, permission.action)),
  );

  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description ? role.description : '',
    assignmentCount: role.assignments.getItems().length,
    permissionCodes,
  };
}
