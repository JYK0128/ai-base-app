import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import { ManagerAccount } from '@/domains/platform/manager/manager.account.entity';
import { Manager, ManagerStatus } from '@/domains/platform/manager/manager.entity';
import { Organization } from '@/domains/platform/organization/organization.entity';
import { ManagerRole } from '@/domains/platform/rbac/manager.role.entity';
import { Role } from '@/domains/platform/rbac/role.entity';

const managerAccountSeeds = [
  {
    email: 'test@example.com',
    password: 'pass1234',
    organizationCode: 'acme',
    roleCode: 'organization_admin',
  },
] as const;

export class PlatformManagerSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const saltRounds = 10;

    for (const managerAccountSeed of managerAccountSeeds) {
      const hashedPassword = await bcrypt.hash(managerAccountSeed.password, saltRounds);
      const organization = await em.findOne(Organization, { code: managerAccountSeed.organizationCode });
      const role = await em.findOne(Role, { code: managerAccountSeed.roleCode });

      if (!organization) {
        throw new Error(`Organization not found for manager seed: ${managerAccountSeed.organizationCode}`);
      }

      if (!role) {
        throw new Error(`Role not found for manager seed: ${managerAccountSeed.roleCode}`);
      }

      const found = await em.findOne(
        ManagerAccount,
        { email: managerAccountSeed.email },
        { populate: ['manager'] },
      );

      let manager = found?.manager;

      if (!manager) {
        manager = em.create(Manager, {
          id: randomUUID(),
          organization,
          status: ManagerStatus.ACTIVE,
        });
        em.persist(manager);
      }

      if (!found) {
        em.persist(em.create(ManagerAccount, {
          id: randomUUID(),
          email: managerAccountSeed.email,
          password: hashedPassword,
          manager,
          passwordExpiresAt: new Date(),
        }));
      }
      else {
        found.password = hashedPassword;
        found.manager = manager;
        found.passwordExpiresAt = new Date();
        manager.organization = organization;
        manager.status = ManagerStatus.ACTIVE;
      }

      await this.assignRole(em, manager, role, organization);
    }

    await em.flush();
  }

  private async assignRole(
    em: EntityManager,
    manager: Manager,
    role: Role,
    organization: Organization,
  ): Promise<void> {
    const found = await em.findOne(ManagerRole, {
      manager,
      role,
      organization,
    });

    if (found) {
      return;
    }

    em.persist(em.create(ManagerRole, {
      id: randomUUID(),
      manager,
      role,
      organization,
    }));
  }
}
