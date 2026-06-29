/**
 * @file platform.seeder.ts
 * @package @pkg/database
 * @description '플랫폼(운영사)' 조직의 기초 데이터를 생성하는 시더입니다.
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
type PlatformMemberSeed = {
  account: InitialMemberAccountData
  roleCode: string
  name: string
  memberStatus?: MemberStatus
};

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysLater = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const PLATFORM_ORGANIZATIONS = [
  {
    code: 'platform',
    name: 'Platform Operations',
    email: 'ops@platform.example',
    metadata: new OrganizationMetadata({ approvedAt: new Date() }),
  },
] satisfies readonly CodedEntityData<Organization>[];

const PLATFORM_ROLES = [
  {
    code: 'OWNER',
    name: 'Owner',
    description: '조직 최고 관리자',
  },
  {
    code: 'MANAGER',
    name: 'Member',
    description: '조직 운영 관리자',
  },
  {
    code: 'VIEWER',
    name: 'Viewer',
    description: '조직 읽기 전용 계정',
  },
] satisfies readonly Omit<CodedEntityData<OrganizationRole>, 'organization'>[];

const PLATFORM_MANAGERS = [
  {
    account: {
      email: 'admin@platform.com',
      password: 'pass1234',
    },
    roleCode: 'OWNER',
    name: 'Platform User 01',
  },
  {
    account: {
      email: 'manager@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      passwordExpiresAt: daysLater(90),
    },
    roleCode: 'MANAGER',
    name: 'Platform User 02',
  },
  {
    account: {
      email: 'viewer@platform.com',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(120),
      passwordExpiresAt: daysAgo(10),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 03',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'owner2@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      passwordExpiresAt: daysLater(75),
    },
    roleCode: 'OWNER',
    name: 'Platform User 04',
  },
  {
    account: {
      email: 'owner3@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(9),
      passwordExpiresAt: daysLater(45),
    },
    roleCode: 'OWNER',
    name: 'Platform User 05',
  },
  {
    account: {
      email: 'manager2@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(2),
      passwordExpiresAt: daysLater(60),
    },
    roleCode: 'MANAGER',
    name: 'Platform User 06',
  },
  {
    account: {
      email: 'manager3@platform.com',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(50),
      passwordExpiresAt: daysAgo(3),
    },
    roleCode: 'MANAGER',
    name: 'Platform User 07',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'viewer2@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(6),
      passwordExpiresAt: daysLater(90),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 08',
  },
  {
    account: {
      email: 'viewer3@platform.com',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(80),
      passwordExpiresAt: daysAgo(2),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 09',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'auditor@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(4),
      passwordExpiresAt: daysLater(120),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 10',
  },
  {
    account: {
      email: 'test02@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(2),
      passwordExpiresAt: daysLater(100),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 11',
  },
  {
    account: {
      email: 'test03@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(9),
      passwordExpiresAt: daysLater(95),
    },
    roleCode: 'MANAGER',
    name: 'Platform User 12',
  },
  {
    account: {
      email: 'test04@platform.com',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(40),
      passwordExpiresAt: daysAgo(6),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 13',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'test05@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(1),
      passwordExpiresAt: daysLater(110),
    },
    roleCode: 'OWNER',
    name: 'Platform User 14',
  },
  {
    account: {
      email: 'test06@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(16),
      passwordExpiresAt: daysLater(80),
    },
    roleCode: 'MANAGER',
    name: 'Platform User 15',
  },
  {
    account: {
      email: 'test07@platform.com',
      password: 'pass1234',
      status: AccountStatus.INACTIVE,
      lastLoginAt: daysAgo(55),
      passwordExpiresAt: daysAgo(4),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 16',
    memberStatus: MemberStatus.INACTIVE,
  },
  {
    account: {
      email: 'test08@platform.com',
      password: 'pass1234',
      status: AccountStatus.ACTIVE,
      lastLoginAt: daysAgo(7),
      passwordExpiresAt: daysLater(140),
    },
    roleCode: 'VIEWER',
    name: 'Platform User 17',
  },
] satisfies readonly PlatformMemberSeed[];

export class PlatformSeeder extends Seeder {
  private orgs: Record<string, Organization> = {};
  private organizationRoles: Record<string, OrganizationRole> = {};

  async run(em: EntityManager): Promise<void> {
    this.orgs = await this.ensureEntities(em, Organization, PLATFORM_ORGANIZATIONS, (seed) => em.create(Organization, seed));
    const platformOrganization = this.orgs.platform;
    this.organizationRoles = await this.ensureOrganizationRoles(em, platformOrganization, PLATFORM_ROLES);

    for (const seed of PLATFORM_MANAGERS) {
      const account = await this.findAccountWithMember(em, seed.account.email);

      if (!account) {
        await this.createPlatformMember(em, platformOrganization, seed);
      }
      else {
        await this.ensureRoleAssignment(em, account.member, platformOrganization, seed.roleCode);
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
      });
      em.persist(created);
      record[seed.code] = created;
    }

    return record;
  }

  private async findAccountWithMember(em: EntityManager, email: string): Promise<MemberAccount | null> {
    return em.findOne(MemberAccount, { email }, { populate: ['member'] });
  }

  private async createPlatformMember(
    em: EntityManager,
    organization: Organization,
    seed: PlatformMemberSeed,
  ): Promise<void> {
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
      status: seed.account.status ?? 'ACTIVE',
      lastLoginAt: seed.account.lastLoginAt,
      passwordExpiresAt: seed.account.passwordExpiresAt ?? daysLater(90),
    });
    em.persist(account);

    await this.ensureRoleAssignment(em, member, organization, seed.roleCode);
  }

  private async ensureRoleAssignment(
    em: EntityManager,
    member: Member,
    organization: Organization,
    roleCode: string,
  ): Promise<void> {
    const organizationRole = this.organizationRoles[roleCode];

    if (!organizationRole) {
      throw new Error(`Organization role not found in PlatformSeeder: ${roleCode}`);
    }

    const hasRole = await em.findOne(OrganizationRoleAssignment, { member, role: organizationRole, organization });
    if (!hasRole) {
      em.persist(em.create(OrganizationRoleAssignment, { member, role: organizationRole, organization }));
    }
  }
}
