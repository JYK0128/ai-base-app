/**
 * @file organization.permission.seeder.ts
 * @package @pkg/database
 * @description 조직 단위 역할과 리소스 권한 매핑을 생성합니다.
 */

import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Organization } from '../domains/platform/organization/organization.entity';
import { OrganizationPermission } from '../domains/platform/organization/organization-permission.entity';
import { OrganizationRole } from '../domains/platform/organization/organization-role.entity';
import { Resource } from '../domains/platform/resource/resource.entity';

type RolePermissionSeed = {
  roleCode: string
  permissionCode: string
};

const PLATFORM_ROLE_PERMISSIONS: RolePermissionSeed[] = [
  { roleCode: 'OWNER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'OWNER', permissionCode: 'ORGANIZATION:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'ORGANIZATION:READ' },
  { roleCode: 'OWNER', permissionCode: 'ORGANIZATION:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'ORGANIZATION:DELETE' },
  { roleCode: 'OWNER', permissionCode: 'ANNOUNCEMENT:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'ANNOUNCEMENT:READ' },
  { roleCode: 'OWNER', permissionCode: 'ANNOUNCEMENT:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'ANNOUNCEMENT:DELETE' },
  { roleCode: 'OWNER', permissionCode: 'SUPPORT:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'SUPPORT:READ' },
  { roleCode: 'OWNER', permissionCode: 'SUPPORT:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'SUPPORT:DELETE' },
  { roleCode: 'OWNER', permissionCode: 'TERMS:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'TERMS:READ' },
  { roleCode: 'OWNER', permissionCode: 'TERMS:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'TERMS:DELETE' },
  { roleCode: 'OWNER', permissionCode: 'RESOURCE:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'RESOURCE:READ' },
  { roleCode: 'OWNER', permissionCode: 'RESOURCE:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'RESOURCE:DELETE' },
  { roleCode: 'OWNER', permissionCode: 'ROLE_RESOURCE_CREATE_BUTTON:READ' },
  { roleCode: 'OWNER', permissionCode: 'ROLE_RESOURCE_SAVE_BUTTON:READ' },
  { roleCode: 'OWNER', permissionCode: 'MEMBER:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'OWNER', permissionCode: 'MEMBER:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'MEMBER:DELETE' },
  { roleCode: 'OWNER', permissionCode: 'PERMISSION:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'PERMISSION:READ' },
  { roleCode: 'OWNER', permissionCode: 'PERMISSION:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'AUDIT:READ' },

  { roleCode: 'MANAGER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'MANAGER', permissionCode: 'ORGANIZATION:READ' },
  { roleCode: 'MANAGER', permissionCode: 'ORGANIZATION:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'ANNOUNCEMENT:CREATE' },
  { roleCode: 'MANAGER', permissionCode: 'ANNOUNCEMENT:READ' },
  { roleCode: 'MANAGER', permissionCode: 'ANNOUNCEMENT:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'SUPPORT:READ' },
  { roleCode: 'MANAGER', permissionCode: 'SUPPORT:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'TERMS:READ' },
  { roleCode: 'MANAGER', permissionCode: 'TERMS:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'RESOURCE:READ' },
  { roleCode: 'MANAGER', permissionCode: 'RESOURCE:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'MANAGER', permissionCode: 'MEMBER:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'PERMISSION:READ' },
  { roleCode: 'MANAGER', permissionCode: 'PERMISSION:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'AUDIT:READ' },

  { roleCode: 'VIEWER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'VIEWER', permissionCode: 'ORGANIZATION:READ' },
  { roleCode: 'VIEWER', permissionCode: 'ANNOUNCEMENT:READ' },
  { roleCode: 'VIEWER', permissionCode: 'SUPPORT:READ' },
  { roleCode: 'VIEWER', permissionCode: 'TERMS:READ' },
  { roleCode: 'VIEWER', permissionCode: 'RESOURCE:READ' },
  { roleCode: 'VIEWER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'VIEWER', permissionCode: 'PERMISSION:READ' },
  { roleCode: 'VIEWER', permissionCode: 'AUDIT:READ' },
];

const CUSTOMER_ROLE_PERMISSIONS: RolePermissionSeed[] = [
  { roleCode: 'OWNER', permissionCode: 'MEMBER:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'OWNER', permissionCode: 'MEMBER:UPDATE' },
  { roleCode: 'OWNER', permissionCode: 'MEMBER:DELETE' },
  { roleCode: 'OWNER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'OWNER', permissionCode: 'PERMISSION:CREATE' },
  { roleCode: 'OWNER', permissionCode: 'PERMISSION:READ' },
  { roleCode: 'OWNER', permissionCode: 'PERMISSION:UPDATE' },

  { roleCode: 'MANAGER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'MANAGER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'MANAGER', permissionCode: 'MEMBER:UPDATE' },
  { roleCode: 'MANAGER', permissionCode: 'PERMISSION:READ' },
  { roleCode: 'MANAGER', permissionCode: 'PERMISSION:UPDATE' },

  { roleCode: 'VIEWER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'VIEWER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'VIEWER', permissionCode: 'PERMISSION:READ' },
];

export class OrganizationPermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const organizations = await em.find(Organization, {});
    const roleMap = this.buildOrganizationRoleMap(await em.find(OrganizationRole, {}, { populate: ['organization'] }));
    const resourceMap = this.buildResourceMap(await em.find(Resource, {}));

    for (const organization of organizations) {
      await this.seedOrganizationPermissions(em, organization, roleMap, resourceMap);
    }

    await em.flush();
  }

  private buildOrganizationRoleMap(organizationRoles: OrganizationRole[]): Map<string, Map<string, OrganizationRole>> {
    const roleMap = new Map<string, Map<string, OrganizationRole>>();

    for (const role of organizationRoles) {
      const organizationId = role.organization.id;
      const scopedRoles = roleMap.get(organizationId) ?? new Map<string, OrganizationRole>();
      scopedRoles.set(role.code, role);
      roleMap.set(organizationId, scopedRoles);
    }

    return roleMap;
  }

  private buildResourceMap(resources: Resource[]): Map<string, Resource> {
    const resourceMap = new Map<string, Resource>();

    for (const resource of resources) {
      resourceMap.set(resource.code, resource);
    }

    return resourceMap;
  }

  private resolveTemplates(organization: Organization): RolePermissionSeed[] {
    return organization.code === 'platform'
      ? PLATFORM_ROLE_PERMISSIONS
      : CUSTOMER_ROLE_PERMISSIONS;
  }

  private async seedOrganizationPermissions(
    em: EntityManager,
    organization: Organization,
    roleMap: Map<string, Map<string, OrganizationRole>>,
    resourceMap: Map<string, Resource>,
  ): Promise<void> {
    const organizationRoles = roleMap.get(organization.id);
    if (!organizationRoles) {
      return;
    }

    const templates = this.resolveTemplates(organization);
    for (const seed of templates) {
      await this.seedOrganizationPermission(em, organization, organizationRoles, resourceMap, seed);
    }
  }

  private async seedOrganizationPermission(
    em: EntityManager,
    organization: Organization,
    organizationRoles: Map<string, OrganizationRole>,
    resourceMap: Map<string, Resource>,
    seed: RolePermissionSeed,
  ): Promise<void> {
    const role = organizationRoles.get(seed.roleCode);
    if (!role) {
      throw new Error(`Organization role not found in OrganizationPermissionSeeder: ${organization.code}.${seed.roleCode}`);
    }

    const [resourceCode, action] = seed.permissionCode.split(':');
    const resource = resourceMap.get(resourceCode);
    if (!resource) {
      throw new Error(`Resource not found in OrganizationPermissionSeeder: ${resourceCode}`);
    }

    const exists = await em.findOne(OrganizationPermission, { role, resource, action });
    if (!exists) {
      em.persist(em.create(OrganizationPermission, {
        role,
        resource,
        action,
        code: `${resource.code}:${action}`,
      }));
    }
  }
}
