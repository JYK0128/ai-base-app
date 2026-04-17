import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { ManagerAccount } from '@/domains/platform/manager/manager.account.entity';

const managerAccountSeeds = [
  {
    email: 'test@example.com',
    password: 'pass1234',
  },
] as const;

export class PlatformManagerSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const managerAccountSeed of managerAccountSeeds) {
      const found = await em.findOne(ManagerAccount, { email: managerAccountSeed.email });

      if (!found) {
        em.persist(em.create(ManagerAccount, {
          id: randomUUID(),
          ...managerAccountSeed,
        }));
        continue;
      }

      found.password = managerAccountSeed.password;
    }

    await em.flush();
  }
}
