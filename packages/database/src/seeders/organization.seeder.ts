/**
 * @file organization.seeder.ts
 * @package @pkg/database
 * @description 일반 고객사 조직용 공통 역할과 초기 데이터를 생성합니다.
 */

import type { BaseEntity, EntityManager, EntityName, FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import { AccountStatus, MemberStatus } from '../domains/platform/member/member.constants';
import { Member } from '../domains/platform/member/member.entity';
import { MemberAccount } from '../domains/platform/member/member-account.entity';
import { Organization, OrganizationMetadata } from '../domains/platform/organization/organization.entity';
import { OrganizationRole } from '../domains/platform/organization/organization-role.entity';
import { OrganizationRoleAssignment } from '../domains/platform/organization/organization-role-assignment.entity';

type CodedEntityData<TEntity extends BaseEntity> = RequiredEntityData<TEntity> & { code: string };
type InitialMemberAccountData = Omit<RequiredEntityData<MemberAccount>, 'email' | 'member' | 'password' | 'passwordExpiresAt'> & {
  email: string
  password: string
  passwordExpiresAt?: Date
};
type CustomerOrganizationAdminSeed = {
  account: InitialMemberAccountData
  organizationCode: string
  roleCode: string
  name: string
  memberStatus?: MemberStatus
};

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysLater = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const CUSTOMER_ORGANIZATIONS = [
  {
    code: 'acme',
    name: 'Acme Corp',
    email: 'ops@acme.example',
    metadata: new OrganizationMetadata({ approvedAt: new Date() }),
  },
] satisfies readonly CodedEntityData<Organization>[];

const ORGANIZATION_ROLE_TEMPLATES = [
  {
    code: 'OWNER',
    name: 'Owner',
    description: '조직 최고 관리자',
    sortOrder: 1,
  },
  {
    code: 'MANAGER',
    name: 'Member',
    description: '조직 운영 관리자',
    sortOrder: 2,
  },
  {
    code: 'VIEWER',
    name: 'Viewer',
    description: '조직 읽기 전용 계정',
    sortOrder: 3,
  },
] satisfies readonly Omit<CodedEntityData<OrganizationRole>, 'organization'>[];

const CUSTOMER_ORGANIZATION_ADMINS = [
  {
    account: {
      email: 'test@example.com',
      password: 'pass1234',
    },
    organizationCode: 'acme',
    roleCode: 'OWNER',
    name: 'Acme User 01',
  },
  {
    account: {
      email: 'manager@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      passwordExpiresAt: daysLater(60),
    },
    organizationCode: 'acme',
    roleCode: 'MANAGER',
    name: 'Acme User 02',
  },
  {
    account: {
      email: 'viewer@acme.example',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(180),
      passwordExpiresAt: daysAgo(5),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 03',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'owner2@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      passwordExpiresAt: daysLater(75),
    },
    organizationCode: 'acme',
    roleCode: 'OWNER',
    name: 'Acme User 04',
  },
  {
    account: {
      email: 'owner3@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(14),
      passwordExpiresAt: daysLater(45),
    },
    organizationCode: 'acme',
    roleCode: 'OWNER',
    name: 'Acme User 05',
  },
  {
    account: {
      email: 'manager2@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(3),
      passwordExpiresAt: daysLater(55),
    },
    organizationCode: 'acme',
    roleCode: 'MANAGER',
    name: 'Acme User 06',
  },
  {
    account: {
      email: 'manager3@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(21),
      passwordExpiresAt: daysLater(30),
    },
    organizationCode: 'acme',
    roleCode: 'MANAGER',
    name: 'Acme User 07',
  },
  {
    account: {
      email: 'viewer2@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(7),
      passwordExpiresAt: daysLater(90),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 08',
  },
  {
    account: {
      email: 'viewer3@acme.example',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(95),
      passwordExpiresAt: daysAgo(2),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 09',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'viewer4@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(1),
      passwordExpiresAt: daysLater(120),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 10',
  },
  {
    account: {
      email: 'staff2@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(11),
      passwordExpiresAt: daysLater(60),
    },
    organizationCode: 'acme',
    roleCode: 'MANAGER',
    name: 'Acme User 11',
  },
  {
    account: {
      email: 'staff3@acme.example',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(60),
      passwordExpiresAt: daysAgo(1),
    },
    organizationCode: 'acme',
    roleCode: 'MANAGER',
    name: 'Acme User 12',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'auditor@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(8),
      passwordExpiresAt: daysLater(150),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 13',
  },
  {
    account: {
      email: 'test02@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(2),
      passwordExpiresAt: daysLater(100),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 14',
  },
  {
    account: {
      email: 'test03@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(4),
      passwordExpiresAt: daysLater(95),
    },
    organizationCode: 'acme',
    roleCode: 'MANAGER',
    name: 'Acme User 15',
  },
  {
    account: {
      email: 'test04@acme.example',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(30),
      passwordExpiresAt: daysAgo(4),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 16',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'test05@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(12),
      passwordExpiresAt: daysLater(110),
    },
    organizationCode: 'acme',
    roleCode: 'OWNER',
    name: 'Acme User 17',
  },
  {
    account: {
      email: 'test06@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(17),
      passwordExpiresAt: daysLater(80),
    },
    organizationCode: 'acme',
    roleCode: 'MANAGER',
    name: 'Acme User 18',
  },
  {
    account: {
      email: 'test07@acme.example',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(42),
      passwordExpiresAt: daysAgo(7),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 19',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'test08@acme.example',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(5),
      passwordExpiresAt: daysLater(130),
    },
    organizationCode: 'acme',
    roleCode: 'VIEWER',
    name: 'Acme User 20',
  },
] satisfies readonly CustomerOrganizationAdminSeed[];

export class OrganizationSeeder extends Seeder {
  private orgs: Record<string, Organization> = {};
  private organizationRoles: Record<string, Record<string, OrganizationRole>> = {};

  async run(em: EntityManager): Promise<void> {
    this.orgs = await this.ensureEntities(em, Organization, CUSTOMER_ORGANIZATIONS, (seed) => em.create(Organization, seed));

    for (const organization of Object.values(this.orgs)) {
      this.organizationRoles[organization.code] = await this.ensureOrganizationRoles(em, organization, ORGANIZATION_ROLE_TEMPLATES);
    }

    for (const seed of CUSTOMER_ORGANIZATION_ADMINS) {
      const account = await this.findAccountWithMember(em, seed.account.email);

      if (!account) {
        await this.createOrganizationAdmin(em, seed);
      }
      else {
        await this.ensureRoleAssignment(em, account.member, seed.organizationCode, seed.roleCode);
      }
    }

    await em.flush();
  }

  private async ensureEntities<TEntity extends BaseEntity & { code: string }>(
    em: EntityManager,
    entityName: EntityName<TEntity>,
    seeds: readonly CodedEntityData<TEntity>[],
    createEntity: (seed: CodedEntityData<TEntity>) => TEntity,
  ): Promise<Record<string, TEntity>> {
    const record: Record<string, TEntity> = {};

    for (const seed of seeds) {
      const entity = await em.findOne(entityName, { code: seed.code } as FilterQuery<TEntity>);

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

  private async ensureOrganizationRoles(
    em: EntityManager,
    organization: Organization,
    seeds: readonly Omit<CodedEntityData<OrganizationRole>, 'organization'>[],
  ): Promise<Record<string, OrganizationRole>> {
    const record: Record<string, OrganizationRole> = {};

    for (const seed of seeds) {
      const entity = await em.findOne(OrganizationRole, {
        organization,
        code: seed.code,
      });

      if (entity) {
        record[seed.code] = entity;
        continue;
      }

      const created = em.create(OrganizationRole, {
        organization,
        code: seed.code,
        name: seed.name,
        ...(seed.description === undefined ? {} : { description: seed.description }),
        ...(seed.sortOrder === undefined ? {} : { sortOrder: seed.sortOrder }),
      });
      em.persist(created);
      record[seed.code] = created;
    }

    return record;
  }

  private async findAccountWithMember(em: EntityManager, email: string): Promise<MemberAccount | null> {
    return em.findOne(MemberAccount, { email }, { populate: ['member'] });
  }

  private async createOrganizationAdmin(
    em: EntityManager,
    seed: CustomerOrganizationAdminSeed,
  ): Promise<void> {
    const organization = this.orgs[seed.organizationCode];

    const member = em.create(Member, {
      organization,
      status: seed.memberStatus ?? MemberStatus.ACTIVE,
      name: seed.name,
      email: seed.account.email,
    });
    em.persist(member);

    const password = await bcrypt.hash(seed.account.password, 10);
    const account = em.create(MemberAccount, {
      email: seed.account.email,
      password,
      member,
      status: seed.account.status ?? AccountStatus.ACTIVE,
      lastLoginAt: seed.account.lastLoginAt,
      passwordExpiresAt: seed.account.passwordExpiresAt ?? daysLater(90),
    });
    em.persist(account);

    await this.ensureRoleAssignment(em, member, seed.organizationCode, seed.roleCode);
  }

  private async ensureRoleAssignment(
    em: EntityManager,
    member: Member,
    organizationCode: string,
    roleCode: string,
  ): Promise<void> {
    const organization = this.orgs[organizationCode];
    const organizationRole = this.organizationRoles[organizationCode]?.[roleCode];

    if (!organization) {
      throw new Error(`Organization not found in OrganizationSeeder: ${organizationCode}`);
    }
    if (!organizationRole) {
      throw new Error(`Organization role not found in OrganizationSeeder: ${roleCode}`);
    }

    const hasRole = await em.findOne(OrganizationRoleAssignment, { member, role: organizationRole, organization });
    if (!hasRole) {
      em.persist(em.create(OrganizationRoleAssignment, { member, role: organizationRole, organization }));
    }
  }
}
