import 'reflect-metadata';
import './ambients/mikro-orm';

export * from './domains';
export * from './entities.generated';
export { default as databaseConfig } from './mikro-orm.config';
