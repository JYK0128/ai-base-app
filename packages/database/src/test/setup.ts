import { MikroORM } from '@mikro-orm/postgresql';

import { DatabaseSeeder } from '@/seeders/DatabaseSeeder';

import ormConfig from '../mikro-orm.config';

export async function setup() {
  let orm: MikroORM | null = null;
  try {
    orm = await MikroORM.init(ormConfig);
    await orm.schema.refresh();
    await orm.seeder.seed(DatabaseSeeder);
  }
  finally {
    await orm?.close(true);
  }
}
