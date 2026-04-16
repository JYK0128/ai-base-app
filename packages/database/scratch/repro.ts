import { MikroORM } from '@mikro-orm/core';
import config from '../src/mikro-orm.config.ts';

try {
  const orm = await MikroORM.init(config);
  console.log('ORM initialized successfully');
  const metadata = orm.getMetadata();
  const cache = orm.config.getCacheAdapter();
  console.log('Cache adapter:', cache.constructor.name);
  await orm.discoverEntities();
  console.log('Entities discovered');
  await orm.close();
} catch (e) {
  console.error(e);
}
