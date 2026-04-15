import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Organization, OrganizationStatus } from '@/domains/organization/organization.entity';

const organizationSeeds = [
  {
    code: 'acme',
    name: 'Acme Corp',
    email: 'ops@acme.example',
    status: OrganizationStatus.ACTIVE,
  },
] as const;

export class OrganizationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const organizationSeed of organizationSeeds) {
      const found = await em.findOne(Organization, { code: organizationSeed.code });

      if (!found) {
        em.persist(em.create(Organization, {
          id: randomUUID(),
          ...organizationSeed,
        }));
        continue;
      }

      found.name = organizationSeed.name;
      found.email = organizationSeed.email;
      found.status = organizationSeed.status;
    }

    await em.flush();
  }
}
