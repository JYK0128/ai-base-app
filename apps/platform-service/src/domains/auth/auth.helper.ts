import type { Member, OrganizationRole } from '@pkg/database';

/**
 * 캐시 키 생성을 일관되게 관리하기 위한 유틸리티입니다.
 * 도메인:액션:식별자 구조를 생성합니다.
 */
export class AuthKeyBuilder {
  constructor(private readonly domain: string) {}

  static for(domain: string) {
    return new AuthKeyBuilder(domain);
  }

  build(action: string, value: string): string {
    return `${this.domain}:${action}:${value}`;
  }
}

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
