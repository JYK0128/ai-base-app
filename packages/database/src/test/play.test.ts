import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { PostgresTestContext } from '@/test/context';
import { createPostgresTestContext, destroyPostgresTestContext } from '@/test/context';

describe('Database Playground', () => {
  let context: PostgresTestContext;

  beforeAll(async () => {
    context = await createPostgresTestContext();
  }, 120_000);

  afterAll(async () => {
    if (context) {
      await destroyPostgresTestContext(context);
    }
  }, 120_000);

  it('should verify database connectivity and perform a simple query', async () => {
    const em = context.orm.em.fork();
    const result = await em.getConnection().execute('SELECT 1 as val');
    expect(result).toBeDefined();
    expect(result[0].val).toBe(1);
  });
});
