/**
 * @file organization.seeder.ts
 * @package @pkg/database
 * @description 일반 고객사 조직용 공통 역할(Role), 권한(Permission) 및 초기 데이터를 생성합니다.
 * @remarks 모든 테넌트 조직에 적용될 표준 권한 체계를 정의하고 테스트용 레퍼런스 데이터를 구축합니다.
 */

import type { BaseEntity, EntityManager, EntityName, FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import { ManagerAccount } from '@/domains/platform/manager/manager.account.entity';
import { Manager, ManagerStatus } from '@/domains/platform/manager/manager.entity';
import { Organization, OrganizationStatus } from '@/domains/platform/organization/organization.entity';
import { ManagerRole } from '@/domains/platform/rbac/manager.role.entity';
import { Resource } from '@/domains/platform/rbac/resource.entity';
import { RbacRoleScope, Role } from '@/domains/platform/rbac/role.entity';
import { RolePermission } from '@/domains/platform/rbac/role.permission.entity';

type CodedEntityData<TEntity extends BaseEntity> = RequiredEntityData<TEntity> & { code: string };
type InitialManagerAccountData = Omit<RequiredEntityData<ManagerAccount>, 'email' | 'manager' | 'password' | 'passwordExpiresAt'> & {
  email: string
  password: string
  passwordExpiresAt?: ManagerAccount['passwordExpiresAt']
};
type CustomerOrganizationAdminSeed = {
  account: InitialManagerAccountData
  organizationCode: string
  roleCode: string
};

// =============================================================================
// [ Section ] 고객사 조직용 공통 역할(Role) 정의
// [ 구조 ] DOMAIN.ROLE_NAME
// =============================================================================
const ORGANIZATION_ROLES = [
  {
    code: 'ORGANIZATION.ADMIN',
    name: 'Organization Admin',
    scope: RbacRoleScope.ORGANIZATION,
    description: '조직 관리자 (멤버 및 역할 관리 가능)',
  },
  {
    code: 'ORGANIZATION.MANAGER',
    name: 'Organization Manager',
    scope: RbacRoleScope.ORGANIZATION,
    description: '조직 운영자 (서비스 실무 권한)',
  },
  {
    code: 'ORGANIZATION.VIEWER',
    name: 'Organization Viewer',
    scope: RbacRoleScope.ORGANIZATION,
    description: '조직 읽기 전용 계정',
  },
] satisfies readonly CodedEntityData<Role>[];

// =============================================================================
// [ Section ] 역할별 권한 매핑 (Role-Permission Mapping)
// =============================================================================
const ORGANIZATION_ROLE_PERMISSIONS: { roleCode: string, permissionCode: string }[] = [
  // ORGANIZATION.ADMIN: 조직 내 모든 관리 및 실무 권한 보유
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'MEMBER:CREATE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'MEMBER:READ' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'MEMBER:UPDATE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'MEMBER:DELETE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'ROLE:CREATE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'ROLE:READ' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'ROLE:UPDATE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'ROLE:DELETE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'ORG_INFO:READ' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'ORG_INFO:UPDATE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'SERVICE:CREATE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'SERVICE:READ' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'SERVICE:UPDATE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'SERVICE:DELETE' },
  { roleCode: 'ORGANIZATION.ADMIN', permissionCode: 'AUDIT:READ' },

  // ORGANIZATION.MANAGER: 실무 권한만 (서비스 데이터 읽기 및 수정)
  { roleCode: 'ORGANIZATION.MANAGER', permissionCode: 'SERVICE:CREATE' },
  { roleCode: 'ORGANIZATION.MANAGER', permissionCode: 'SERVICE:READ' },
  { roleCode: 'ORGANIZATION.MANAGER', permissionCode: 'SERVICE:UPDATE' },
  { roleCode: 'ORGANIZATION.MANAGER', permissionCode: 'SERVICE:DELETE' },

  // ORGANIZATION.VIEWER: 읽기 전용 권한
  { roleCode: 'ORGANIZATION.VIEWER', permissionCode: 'SERVICE:READ' },
];

// =============================================================================
// [ Section ] 테스트용 고객사 및 초기 관리자 데이터
// =============================================================================
const CUSTOMER_ORGANIZATIONS = [
  {
    code: 'acme',
    name: 'Acme Corp',
    email: 'ops@acme.example',
    status: OrganizationStatus.ACTIVE,
  },
] satisfies readonly CodedEntityData<Organization>[];

const CUSTOMER_ORGANIZATION_ADMINS = [
  {
    account: {
      email: 'test@example.com',
      password: 'pass1234',
    },
    organizationCode: 'acme',
    roleCode: 'ORGANIZATION.ADMIN',
  },
] satisfies readonly CustomerOrganizationAdminSeed[];

/**
 * OrganizationSeeder
 *
 * 모든 고객사 조직에 공통적으로 적용될 표준 RBAC 체계를 수립합니다.
 */
export class OrganizationSeeder extends Seeder {
  private orgs: Record<string, Organization> = {};
  private roles: Record<string, Role> = {};
  private resources: Record<string, Resource> = {};

  /**
   * 시더 실행 메인 루틴
   */
  async run(em: EntityManager): Promise<void> {
    // 1. 기초 엔티티 생성 및 객체 보관
    this.roles = await this.ensureEntities(em, Role, ORGANIZATION_ROLES, (seed) => em.create(Role, seed));
    this.orgs = await this.ensureEntities(em, Organization, CUSTOMER_ORGANIZATIONS, (seed) => em.create(Organization, seed));

    // Fetch pre-seeded resources
    const resources = await em.find(Resource, {});
    for (const res of resources) {
      this.resources[res.code] = res;
    }

    // 2. 역할-권한 관계 설정
    for (const seed of ORGANIZATION_ROLE_PERMISSIONS) {
      const [resourceCode, action] = seed.permissionCode.split(':');
      const resource = this.resources[resourceCode];
      if (!resource) {
        throw new Error(`Resource not found in OrganizationSeeder: ${resourceCode}`);
      }
      await this.ensureRolePermission(
        em,
        this.roles[seed.roleCode],
        resource,
        action,
      );
    }

    // 3. 고객사 관리자 계정 설정
    for (const seed of CUSTOMER_ORGANIZATION_ADMINS) {
      const account = await this.findAccountWithManager(em, seed.account.email);

      if (!account) {
        await this.createOrganizationAdmin(em, seed);
      }
      else {
        await this.ensureManagerRole(em, account.manager, seed.roleCode, seed.organizationCode);
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
   * 고객사 관리자 계정과 매니저 프로필을 생성합니다.
   */
  private async createOrganizationAdmin(
    em: EntityManager,
    seed: CustomerOrganizationAdminSeed,
  ): Promise<void> {
    const organization = this.orgs[seed.organizationCode];

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

    await this.ensureManagerRole(em, manager, seed.roleCode, seed.organizationCode);
  }

  /**
   * 매니저에게 특정 역할(Role)을 할당합니다 (중복 방지).
   */
  private async ensureManagerRole(
    em: EntityManager,
    manager: Manager,
    roleCode: string,
    organizationCode: string,
  ): Promise<void> {
    const role = this.roles[roleCode];
    const organization = this.orgs[organizationCode];

    const hasRole = await em.findOne(ManagerRole, { manager, role, organization });
    if (!hasRole) {
      em.persist(em.create(ManagerRole, { manager, role, organization }));
    }
  }
}
