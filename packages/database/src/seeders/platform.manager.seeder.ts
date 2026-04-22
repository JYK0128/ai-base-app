import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import bcrypt from 'bcrypt';

import { ManagerAccount } from '@/domains/platform/manager/manager.account.entity';

const managerAccountSeeds = [
  {
    email: 'test@example.com',
    password: 'pass1234',
  },
] as const;

export class PlatformManagerSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const saltRounds = 10;

    for (const managerAccountSeed of managerAccountSeeds) {
      const hashedPassword = await bcrypt.hash(managerAccountSeed.password, saltRounds);
      const found = await em.findOne(ManagerAccount, { email: managerAccountSeed.email });

      if (!found) {
        em.persist(em.create(ManagerAccount, {
          id: randomUUID(),
          ...managerAccountSeed,
          password: hashedPassword,
        }));
        continue;
      }

      found.password = hashedPassword;
    }

    await em.flush();
  }
}
