/**
 * @file platform.seeder.ts
 * @package @pkg/database
 * @description '플랫폼(운영사)' 조직의 기초 데이터를 생성하는 시더입니다.
 */

import type { BaseEntity, EntityManager, EntityName, FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import { MemberAccount } from '../domains/platform/member/member.account.entity';
import { Member, MemberStatus } from '../domains/platform/member/member.entity';
import { Organization, OrganizationMetadata } from '../domains/platform/organization/organization.entity';
import { OrganizationRole } from '../domains/platform/organization/organization.role.entity';
import { OrganizationRoleAssignment } from '../domains/platform/organization/organization.role-assignment.entity';

type CodedEntityData<TEntity extends BaseEntity> = RequiredEntityData<TEntity> & { code: string };
type InitialMemberAccountData = Omit<RequiredEntityData<MemberAccount>, 'email' | 'member' | 'password' | 'passwordExpiresAt'> & {
  email: string
  password: string
  passwordExpiresAt?: MemberAccount['passwordExpiresAt']
};
type PlatformMemberSeed = {
  account: InitialMemberAccountData
  roleCode: string
  name: string
};

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
    name: 'Platform Admin',
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
        description: seed.description,
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
      status: MemberStatus.ACTIVE,
      name: seed.name,
    });
    em.persist(member);

    const password = await bcrypt.hash(seed.account.password, 10);
    const account = em.create(MemberAccount, {
      email: seed.account.email,
      password,
      member,
      passwordExpiresAt: seed.account.passwordExpiresAt ?? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
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
