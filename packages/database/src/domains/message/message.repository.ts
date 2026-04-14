import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';

import { CoreRepository } from '../core/core.repository';
import { Message } from './message.entity';

export interface MessageRecord {
  locale: string
  namespace: string
  key: string
  message: string
}

export class MessageRepository extends CoreRepository<Message> {
  constructor(em: EntityManager) {
    super(em, Message);
  }

  async findMany(params?: { locale?: string, namespace?: string }): Promise<MessageRecord[]> {
    const rows = await this.em.find(Message, {
      ...(params?.locale ? { locale: params.locale } : {}),
      ...(params?.namespace ? { namespace: params.namespace } : {}),
    });

    return rows.map((row) => ({
      locale: row.locale,
      namespace: row.namespace,
      key: row.key,
      message: row.message,
    }));
  }

  async upsertMany(records: MessageRecord[]): Promise<void> {
    if (!records.length) {
      return;
    }

    for (const record of records) {
      const found = await this.em.findOne(Message, {
        locale: record.locale,
        namespace: record.namespace,
        key: record.key,
      });

      if (found) {
        found.message = record.message;
        continue;
      }

      const created = this.em.create(Message, {
        id: randomUUID(),
        locale: record.locale,
        namespace: record.namespace,
        key: record.key,
        message: record.message,
      });

      this.em.persist(created);
    }

    await this.em.flush();
  }
}

export const createMessageRepository = (
  em: EntityManager,
): MessageRepository => new MessageRepository(em);
