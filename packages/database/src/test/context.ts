import { MikroORM } from '@mikro-orm/postgresql';

import config from '@/mikro-orm.config';

export interface PostgresTestContext {
  orm: MikroORM
}

/**
 * 생성
 */
export async function createPostgresTestContext(): Promise<PostgresTestContext> {
  const orm = await MikroORM.init({
    ...config,
    debug: true,
  });

  return {
    orm,
  };
}

/**
 * 삭제
 */
export async function destroyPostgresTestContext(context: Partial<PostgresTestContext>): Promise<void> {
  if (context.orm) {
    await context.orm.close(true);
  }
}
