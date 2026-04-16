import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Message, MessageRepository } from '@/domains';
import type { PostgresTestContext } from '@/test/context';
import { createPostgresTestContext, destroyPostgresTestContext } from '@/test/context';

describe('example query test', () => {
  const context: Partial<PostgresTestContext> = {};
  let repository: MessageRepository;

  beforeAll(async () => {
    Object.assign(context, await createPostgresTestContext());
    repository = context.orm!.em.getRepository(Message);
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

    const records = await repository.find({ locale: 'ko' });
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
