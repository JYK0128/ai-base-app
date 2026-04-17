import { RequestContext } from '@mikro-orm/core';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Message } from '@/domains';
import type { PostgresTestContext } from '@/test/context';
import { createPostgresTestContext, destroyPostgresTestContext } from '@/test/context';

describe('Database Infrastructure Examples', () => {
  let context: PostgresTestContext;

  beforeAll(async () => {
    context = await createPostgresTestContext();
  }, 120_000);

  beforeEach(async () => {
    const em = context.orm.em.fork();
    await em.createQueryBuilder(Message).delete().execute();
  });

  afterAll(async () => {
    if (context) {
      await destroyPostgresTestContext(context);
    }
  }, 120_000);

  /**
   * 1. 기본적인 CRUD 및 EM 활용 예제
   */
  it('should perform core CRUD operations using EM-centric patterns', async () => {
    // RequestContext 내에서의 작업 (Entity 내부에서 em을 사용함)
    await RequestContext.create(context.orm.em, async () => {
      const em = RequestContext.getEntityManager()!;

      // Create
      const msg = Message.create({
        locale: 'ko',
        namespace: 'test',
        key: 'welcome',
        message: '환영합니다',
      });
      await em.flush();

      // Read (Identity lookup via Entity)
      const readRef = Message.read(msg.id);
      expect(readRef.id).toBe(msg.id);

      // Filter lookup via Repository
      const repo = em.getRepository(Message);
      const found = await repo.findOne({ key: 'welcome' });
      expect(found?.message).toBe('환영합니다');

      // Update
      found?.update({ message: 'Welcome!' });
      await em.flush();

      const updated = await repo.findOne({ id: msg.id });
      expect(updated?.message).toBe('Welcome!');

      // Delete
      if (updated) {
        updated.delete(true);
        await em.flush();
      }

      const deleted = await repo.findOne({ id: msg.id });
      expect(deleted).toBeNull();
    });
  });

  /**
   * 2. 검색 및 필터링 예제 (Repository 활용)
   */
  it('should search entities with flexible filters via repository', async () => {
    const em = context.orm.em.fork();
    const repo = em.getRepository(Message);

    await repo.upsertMany([
      repo.create({ locale: 'ko', namespace: 'search', key: 'k1', message: 'Apple' }),
      repo.create({ locale: 'en', namespace: 'search', key: 'k2', message: 'Banana' }),
      repo.create({ locale: 'ko', namespace: 'search', key: 'k3', message: 'Cherry' }),
    ], {
      onConflictFields: ['locale', 'namespace', 'key'],
      onConflictAction: 'merge',
    });
    await em.flush();

    const partial = await repo.search({ message: '%pp%' });
    expect(partial.items).toHaveLength(1);
    expect(partial.items[0]?.message).toBe('Apple');

    const multi = await repo.search({ locale: ['en', 'ja'] });
    expect(multi.items).toHaveLength(1);
    expect(multi.items[0]?.key).toBe('k2');

    const sorted = await repo.search({ namespace: 'search', orderBy: 'message:DESC' });
    expect(sorted.items[0]?.message).toBe('Cherry');
  });

  /**
   * 3. 커서 기반 페이징 예제
   */
  it('should support robust cursor-based pagination', async () => {
    const em = context.orm.em.fork();
    const repo = em.getRepository(Message);

    await repo.upsertMany([
      repo.create({ locale: 'ko', namespace: 'page', key: 'p1', message: 'Msg 1' }),
      repo.create({ locale: 'ko', namespace: 'page', key: 'p2', message: 'Msg 2' }),
      repo.create({ locale: 'ko', namespace: 'page', key: 'p3', message: 'Msg 3' }),
    ], {
      onConflictFields: ['locale', 'namespace', 'key'],
      onConflictAction: 'merge',
    });
    await em.flush();

    const page1 = await repo.searchByCursor({ namespace: 'page', first: 2, orderBy: 'key:ASC' });
    expect(page1.items).toHaveLength(2);
    expect(page1.hasNextPage).toBe(true);

    const page2 = await repo.searchByCursor({
      namespace: 'page',
      after: page1.endCursor,
      first: 10,
      orderBy: 'key:ASC',
    });
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]?.key).toBe('p3');
  });

  /**
   * 4. 로우 쿼리(Raw SQL) 활용 예제
   */
  it('should allow raw SQL execution when needed', async () => {
    const em = context.orm.em.fork();
    const result = await em.getConnection().execute('SELECT 1 as val');
    expect(result).toBeDefined();
    expect(result[0].val).toBe(1);
  });
});
