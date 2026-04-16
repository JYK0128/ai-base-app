import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Message } from '@/domains/platform/message/message.entity';

const messageSeeds = [
  {
    locale: 'ko',
    namespace: 'common',
    key: 'welcome',
    message: '안녕하세요',
  },
] as const;

export class MessageSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const messageSeed of messageSeeds) {
      const found = await em.findOne(Message, {
        locale: messageSeed.locale,
        namespace: messageSeed.namespace,
        key: messageSeed.key,
      });

      if (!found) {
        em.persist(em.create(Message, {
          id: randomUUID(),
          ...messageSeed,
        }));
        continue;
      }

      found.message = messageSeed.message;
    }

    await em.flush();
  }
}
