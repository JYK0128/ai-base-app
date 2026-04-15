import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Organization } from '@/domains/organization/organization.entity';
import { Site } from '@/domains/site/site.entity';

const siteSeeds = [
  {
    organizationCode: 'acme',
    code: 'hq',
    name: 'Acme HQ',
    description: 'Primary site for Acme Corp',
    isActive: true,
  },
] as const;

export class SiteSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const siteSeed of siteSeeds) {
      const organization = await em.findOne(Organization, { code: siteSeed.organizationCode });

      if (!organization) {
        throw new Error(`Organization not found for site seed: ${siteSeed.organizationCode}`);
      }

      const found = await em.findOne(Site, {
        organization: organization.id,
        code: siteSeed.code,
      });

      if (!found) {
        em.persist(em.create(Site, {
          id: randomUUID(),
          organization,
          code: siteSeed.code,
          name: siteSeed.name,
          description: siteSeed.description,
          isActive: siteSeed.isActive,
        }));
        continue;
      }

      found.name = siteSeed.name;
      found.description = siteSeed.description;
      found.isActive = siteSeed.isActive;
    }

    await em.flush();
  }
}
