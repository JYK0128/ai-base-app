import 'reflect-metadata';
import './types/mikro-orm';

export * from './domains';
export * from './entities.generated';
export { default as databaseConfig } from './mikro-orm.config';
