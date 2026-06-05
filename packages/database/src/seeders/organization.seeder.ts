/**
 * @file organization.seeder.ts
 * @package @pkg/database
 * @description 일반 고객사 조직용 공통 역할과 초기 데이터를 생성합니다.
 */

import type { BaseEntity, EntityManager, EntityName, FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import { MemberAccount } from '@/domains/platform/member/member.account.entity';
import { Member, MemberStatus } from '@/domains/platform/member/member.entity';
import { Organization, OrganizationStatus } from '@/domains/platform/organization/organization.entity';
import { OrganizationRole } from '@/domains/platform/organization/organization.role.entity';
import { OrganizationRoleAssignment } from '@/domains/platform/organization/organization.role-assignment.entity';

type CodedEntityData<TEntity extends BaseEntity> = RequiredEntityData<TEntity> & { code: string };
type InitialMemberAccountData = Omit<RequiredEntityData<MemberAccount>, 'email' | 'member' | 'password' | 'passwordExpiresAt'> & {
  email: string
  password: string
  passwordExpiresAt?: MemberAccount['passwordExpiresAt']
};
type CustomerOrganizationAdminSeed = {
  account: InitialMemberAccountData
  organizationCode: string
  roleCode: string
  name: string
};

const CUSTOMER_ORGANIZATIONS = [
  {
    code: 'acme',
    name: 'Acme Corp',
    email: 'ops@acme.example',
    status: OrganizationStatus.ACTIVE,
  },
] satisfies readonly CodedEntityData<Organization>[];

const ORGANIZATION_ROLE_TEMPLATES = [
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

const CUSTOMER_ORGANIZATION_ADMINS = [
  {
    account: {
      email: 'test@example.com',
      password: 'pass1234',
    },
    organizationCode: 'acme',
    roleCode: 'OWNER',
    name: 'Acme Admin',
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

  private async createOrganizationAdmin(
    em: EntityManager,
    seed: CustomerOrganizationAdminSeed,
  ): Promise<void> {
    const organization = this.orgs[seed.organizationCode];

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
