import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { MessageRepository } from '@/domains/message/message.repository';
import type { PostgresTestContext } from '@/test/context';
import { createPostgresTestContext, destroyPostgresTestContext } from '@/test/context';

describe('example query test', () => {
  const context: Partial<PostgresTestContext> = {};
  let repository: MessageRepository;

  beforeAll(async () => {
    Object.assign(context, await createPostgresTestContext());
    repository = new MessageRepository(context.orm!.em.fork());
  }, 120_000);

  afterAll(async () => {
    await destroyPostgresTestContext(context);
  }, 120_000);

  it.skip('example: repository query + raw SQL', async () => {
    await repository.upsertMany([
      {
        locale: 'ko',
        namespace: 'common',
        key: 'hello',
        message: '안녕하세요',
      },
      {
        locale: 'en',
        namespace: 'common',
        key: 'hello',
        message: 'hello',
      },
    ]);

    const records = await repository.findMany({ locale: 'ko' });
    expect(records).toEqual([
      {
        locale: 'ko',
        namespace: 'common',
        key: 'hello',
        message: '안녕하세요',
      },
    ]);

    const rows = await context.orm!.em.getConnection().execute(
      'select locale, namespace, key, message from platform.message order by locale asc',
    );

    expect(rows).toHaveLength(2);
  });
});
