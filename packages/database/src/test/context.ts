import { MikroORM } from '@mikro-orm/postgresql';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

import config from '@/mikro-orm.config';

export interface PostgresTestContext {
  container: StartedPostgreSqlContainer
  orm: MikroORM
}

/**
 * 생성
 */
export async function createPostgresTestContext(): Promise<PostgresTestContext> {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('database_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const orm = await MikroORM.init({
    ...config,
    clientUrl: container.getConnectionUri(),
    debug: true,
  });

  await orm.schema.refresh();

  return {
    container,
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

  if (context.container) {
    await context.container.stop();
  }
}
