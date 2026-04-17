import { RequestContext } from '@mikro-orm/core';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Message } from '@/domains';
import type { PostgresTestContext } from '@/test/context';
import { createPostgresTestContext, destroyPostgresTestContext } from '@/test/context';

describe('example query test', () => {
  const context: Partial<PostgresTestContext> = {};

  beforeAll(async () => {
    Object.assign(context, await createPostgresTestContext());
  }, 120_000);

  beforeEach(async () => {
    const em = context.orm!.em.fork();
    await em.createQueryBuilder(Message).delete().execute();
  });

  afterAll(async () => {
    await destroyPostgresTestContext(context);
  }, 120_000);

  it('example: repository query + raw SQL', async () => {
    const em = context.orm!.em.fork();
    const repo = em.getRepository(Message);

    await repo.upsertMany(
      [
        repo.create({
          locale: 'ko',
          namespace: 'common',
          key: 'hello',
          message: '안녕하세요',
        }),
        repo.create({
          locale: 'en',
          namespace: 'common',
          key: 'hello',
          message: 'hello',
        }),
      ],
      {
        onConflictFields: ['locale', 'namespace', 'key'],
        onConflictAction: 'merge',
        onConflictMergeFields: ['message', 'updatedAt', 'updatedBy'],
      },
    );

    const records = await repo.find({ locale: 'ko', key: 'hello' });
    expect(records).toEqual([
      expect.objectContaining({
        locale: 'ko',
        namespace: 'common',
        key: 'hello',
        message: '안녕하세요',
      }),
    ]);

    const rows = await em.getConnection().execute(
      'select locale, namespace, key, message from "platform"."Message" where key = \'hello\' order by locale asc',
    );

    expect(rows).toHaveLength(2);
  });

  it('example: static Entity.create check', async () => {
    await RequestContext.create(context.orm!.em, async () => {
      const em = RequestContext.getEntityManager()!;
      // CoreEntity의 정적 create 메소드는 내부적으로 RequestContext.getEntityManager()를 사용함
      const msg = Message.create({
        locale: 'ko',
        namespace: 'common',
        key: 'static_test',
        message: 'static create test',
      });

      expect(msg).toBeInstanceOf(Message);
      expect(msg.key).toBe('static_test');
      expect(msg.id).toBeDefined();

      await em.flush();

      const found = await em.findOne(Message, { key: 'static_test' });
      expect(found).not.toBeNull();
      expect(found?.message).toBe('static create test');
    });
  });
});
