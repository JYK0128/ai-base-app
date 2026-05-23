/**
 * @file platform.seeder.ts
 * @package @pkg/database
 * @description '플랫폼(운영사)' 조직의 기초 데이터를 생성하는 시더입니다.
 * @remarks 이 시더는 공용 시더가 아니며, 시스템 전역 설정을 관리하는 특수 조직(platform)을 대상으로 합니다.
 */

import type { BaseEntity, EntityManager, EntityName, FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import { ManagerAccount } from '@/domains/platform/manager/manager.account.entity';
import { Manager, ManagerStatus } from '@/domains/platform/manager/manager.entity';
import { ManagerRole } from '@/domains/platform/manager/manager.role.entity';
import { Organization, OrganizationStatus } from '@/domains/platform/organization/organization.entity';
import { Resource } from '@/domains/platform/resource/resource.entity';
import { Role, RoleScope } from '@/domains/platform/role/role.entity';
import { RolePermission } from '@/domains/platform/role/role.permission.entity';

type CodedEntityData<TEntity extends BaseEntity> = RequiredEntityData<TEntity> & { code: string };
type InitialManagerAccountData = Omit<RequiredEntityData<ManagerAccount>, 'email' | 'manager' | 'password' | 'passwordExpiresAt'> & {
  email: string
  password: string
  passwordExpiresAt?: ManagerAccount['passwordExpiresAt']
};
type SuperAdminSeed = {
  account: InitialManagerAccountData
  roleCode: string
};

// =============================================================================
// [ Section ] 플랫폼 조직 정보 정의
// =============================================================================
const ORGANIZATIONS = [
  {
    code: 'platform',
    name: 'Platform Operations',
    email: 'ops@platform.example',
    status: OrganizationStatus.ACTIVE,
  },
] satisfies readonly CodedEntityData<Organization>[];

// =============================================================================
// [ Section ] 플랫폼 전용 역할(Role) 정의
// [ 구조 ] DOMAIN.ROLE_NAME
// =============================================================================
const ROLES = [
  {
    code: 'PLATFORM.ADMIN',
    name: 'Platform Admin',
    scope: RoleScope.PLATFORM,
    description: '플랫폼 전체 관리자 (모든 권한)',
  },
  {
    code: 'PLATFORM.MANAGER',
    name: 'Platform Manager',
    scope: RoleScope.PLATFORM,
    description: '플랫폼 실무 운영자 (조직 승인 및 고객 지원)',
  },
  {
    code: 'PLATFORM.VIEWER',
    name: 'Platform Viewer',
    scope: RoleScope.PLATFORM,
    description: '플랫폼 읽기 전용 계정',
  },
  {
    code: 'PLATFORM.TESTER',
    name: 'Platform Tester',
    scope: RoleScope.PLATFORM,
    description: '권한 접근성 테스트용 최소 권한 계정',
  },
] satisfies readonly CodedEntityData<Role>[];

// =============================================================================
// [ Section ] 역할별 권한 매핑 (Role-Permission Mapping)
// =============================================================================
const ROLE_PERMISSIONS: { roleCode: string, permissionCode: string }[] = [
  // PLATFORM.ADMIN: 모든 권한 보유
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ORGANIZATION:CREATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ORGANIZATION:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ORGANIZATION:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ORGANIZATION:DELETE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ANNOUNCEMENT:CREATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ANNOUNCEMENT:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ANNOUNCEMENT:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ANNOUNCEMENT:DELETE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SUPPORT:CREATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SUPPORT:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SUPPORT:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SUPPORT:DELETE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'AUDIT:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'TERMS:CREATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'TERMS:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'TERMS:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'TERMS:DELETE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'RESOURCE:CREATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'RESOURCE:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'RESOURCE:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'RESOURCE:DELETE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ROLE_RESOURCE_CREATE_BUTTON:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ROLE_RESOURCE_SAVE_BUTTON:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'MEMBER:CREATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'MEMBER:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'MEMBER:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'MEMBER:DELETE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ORG_INFO:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'ORG_INFO:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SERVICE:CREATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SERVICE:READ' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SERVICE:UPDATE' },
  { roleCode: 'PLATFORM.ADMIN', permissionCode: 'SERVICE:DELETE' },

  // PLATFORM.MANAGER: 운영 및 지원 실무 (읽기 및 수정 중심)
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'ORGANIZATION:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'ORGANIZATION:UPDATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'ANNOUNCEMENT:CREATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'ANNOUNCEMENT:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'ANNOUNCEMENT:UPDATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'SUPPORT:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'SUPPORT:UPDATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'TERMS:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'TERMS:UPDATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'RESOURCE:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'RESOURCE:UPDATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'MEMBER:UPDATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'ORG_INFO:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'ORG_INFO:UPDATE' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'SERVICE:READ' },
  { roleCode: 'PLATFORM.MANAGER', permissionCode: 'SERVICE:UPDATE' },

  // PLATFORM.VIEWER: 읽기 전용
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'ORGANIZATION:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'ANNOUNCEMENT:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'SUPPORT:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'TERMS:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'RESOURCE:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'MEMBER:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'ORG_INFO:READ' },
  { roleCode: 'PLATFORM.VIEWER', permissionCode: 'SERVICE:READ' },

  // PLATFORM.TESTER: 대시보드만 접근 가능한 최소 권한 테스트 계정
  { roleCode: 'PLATFORM.TESTER', permissionCode: 'DASHBOARD:READ' },
  { roleCode: 'PLATFORM.TESTER', permissionCode: 'RESOURCE:READ' },
];

// =============================================================================
// [ Section ] 초기 시스템 관리자 계정 정의
// =============================================================================
const SUPER_ADMINS = [
  {
    account: {
      email: 'admin@platform.com',
      password: 'pass1234',
      passwordExpiresAt: new Date(),
    },
    roleCode: 'PLATFORM.ADMIN',
  },
  {
    account: {
      email: 'tester@platform.com',
      password: 'pass1234',
      passwordExpiresAt: new Date(),
    },
    roleCode: 'PLATFORM.TESTER',
  },
] satisfies readonly SuperAdminSeed[];

/**
 * PlatformSeeder
 *
 * '플랫폼' 조직의 정체성을 정의하며, 시스템의 첫 번째 관리자 계정과
 * 운영에 필요한 최상위 역할/권한 체계를 구축합니다.
 */
export class PlatformSeeder extends Seeder {
  private orgs: Record<string, Organization> = {};
  private roles: Record<string, Role> = {};
  private resources: Record<string, Resource> = {};

  /**
   * 시더 실행 메인 루틴
   */
  async run(em: EntityManager): Promise<void> {
    // 1. 기초 엔티티 생성 및 객체 보관
    this.orgs = await this.ensureEntities(em, Organization, ORGANIZATIONS, (seed) => em.create(Organization, seed));
    this.roles = await this.ensureEntities(em, Role, ROLES, (seed) => em.create(Role, seed));

    // Fetch pre-seeded resources from ResourceSeeder
    const resources = await em.find(Resource, {});
    for (const res of resources) {
      this.resources[res.code] = res;
    }

    // 2. 역할-권한 관계 설정
    for (const seed of ROLE_PERMISSIONS) {
      const [resourceCode, action] = seed.permissionCode.split(':');
      const resource = this.resources[resourceCode];
      if (!resource) {
        throw new Error(`Resource not found in PlatformSeeder: ${resourceCode}`);
      }
      await this.ensureRolePermission(
        em,
        this.roles[seed.roleCode],
        resource,
        action,
      );
    }

    // 3. 시스템 관리자 계정 및 역할 설정
    for (const seed of SUPER_ADMINS) {
      const account = await this.findAccountWithManager(em, seed.account.email);

      if (!account) {
        await this.createSuperAdmin(em, seed);
      }
      else {
        await this.ensureManagerRole(em, account.manager, seed.roleCode);
      }
    }

    await em.flush();
  }

  /**
   * 엔티티 존재 여부를 확인하고 없으면 생성하여 레코드로 반환합니다.
   */
  private async ensureEntities<TEntity extends BaseEntity & { code: string }>(
    em: EntityManager,
    entityName: EntityName<TEntity>,
    seeds: readonly CodedEntityData<TEntity>[],
    createEntity: (seed: CodedEntityData<TEntity>) => TEntity,
  ): Promise<Record<string, TEntity>> {
    const record: Record<string, TEntity> = {};
    for (const seed of seeds) {
      const query = { code: seed.code } as FilterQuery<TEntity>;
      const entity = await em.findOne(entityName, query);

      if (entity) {
        record[seed.code] = entity;
        continue;
      }

      const created = createEntity(seed);
      em.persist(created);
      record[seed.code] = created;
    }
    return record;
  }

  /**
   * 역할과 권한의 관계가 없을 때만 생성합니다.
   */
  private async ensureRolePermission(
    em: EntityManager,
    role: Role,
    resource: Resource,
    action: string,
  ): Promise<void> {
    const exists = await em.findOne(RolePermission, { role, resource, action });
    if (!exists) {
      em.persist(em.create(RolePermission, { role, resource, action }));
    }
  }

  /**
   * 매니저 정보를 포함한 관리자 계정을 조회합니다.
   */
  private async findAccountWithManager(em: EntityManager, email: string): Promise<ManagerAccount | null> {
    return em.findOne(ManagerAccount, { email }, { populate: ['manager'] });
  }

  /**
   * 새로운 시스템 관리자와 매니저 프로필을 생성합니다.
   */
  private async createSuperAdmin(
    em: EntityManager,
    seed: SuperAdminSeed,
  ): Promise<void> {
    const organization = this.orgs.platform;

    const manager = em.create(Manager, {
      organization,
      status: ManagerStatus.ACTIVE,
    });
    em.persist(manager);

    const password = await bcrypt.hash(seed.account.password, 10);
    em.persist(
      em.create(ManagerAccount, {
        email: seed.account.email,
        password,
        manager,
        passwordExpiresAt: seed.account.passwordExpiresAt ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      }),
    );

    await this.ensureManagerRole(em, manager, seed.roleCode);
  }

  /**
   * 매니저에게 역할이 없는 경우에만 부여합니다.
   */
  private async ensureManagerRole(
    em: EntityManager,
    manager: Manager,
    roleCode: string,
  ): Promise<void> {
    const role = this.roles[roleCode];
    const organization = this.orgs.platform;

    const hasRole = await em.findOne(ManagerRole, { manager, role, organization });
    if (!hasRole) {
      em.persist(em.create(ManagerRole, { manager, role, organization }));
    }
  }
}
