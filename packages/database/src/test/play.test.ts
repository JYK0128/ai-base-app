import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Member, MemberStatus } from '@/domains';
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

  it('should select database using kysely', async () => {
    const em = context.orm.em.fork();
    const members = await em.find(Member, {});
    expect(Array.isArray(members)).toBe(true);
  });

  it('should test where clause filtering', async () => {
    const em = context.orm.em.fork();
    const activeMembers = await em.find(Member, { status: MemberStatus.ACTIVE });
    expect(Array.isArray(activeMembers)).toBe(true);
    activeMembers.forEach((member) => {
      expect(member.status).toBe('ACTIVE');
    });
  });

  it('test', async () => {
    const em = context.orm.em.fork();
    const res = await em.find(Member, {});
    expect(res.length).toBeGreaterThan(0);
  });
});
