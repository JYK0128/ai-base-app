import { MikroORM } from '@mikro-orm/postgresql';

import ormConfig from '../mikro-orm.config';
import { DatabaseSeeder } from '../seeders/DatabaseSeeder';

export default async function setup() {
  console.log('start setup');
  let orm: MikroORM | null = null;
  try {
    orm = await MikroORM.init(ormConfig);
    await orm.schema.refresh();
    await orm.seeder.seed(DatabaseSeeder);
  }
  finally {
    console.log('close setup');
    await orm?.close(true);
  }
}
