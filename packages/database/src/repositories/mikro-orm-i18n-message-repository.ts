import { randomUUID } from 'node:crypto';

import type { EntityManager } from '@mikro-orm/core';

import { I18nMessage } from '../entities';

export interface I18nMessageRecord {
  locale: string;
  namespace: string;
  key: string;
  message: string;
}

export class MikroOrmI18nMessageStore {
  constructor(private readonly em: EntityManager) {}

  async findMany(params?: { locale?: string; namespace?: string }): Promise<I18nMessageRecord[]> {
    const rows = await this.em.find(I18nMessage, {
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

  async upsertMany(records: I18nMessageRecord[]): Promise<void> {
    if (!records.length) {
      return;
    }

    for (const record of records) {
      const found = await this.em.findOne(I18nMessage, {
        locale: record.locale,
        namespace: record.namespace,
        key: record.key,
      });

      if (found) {
        found.message = record.message;
        continue;
      }

      const created = this.em.create(I18nMessage, {
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

export const createMikroOrmI18nMessageStore = (
  em: EntityManager,
): MikroOrmI18nMessageStore => new MikroOrmI18nMessageStore(em);
