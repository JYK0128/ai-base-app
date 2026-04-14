import 'reflect-metadata';

import path from 'node:path';

import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import { CamelCaseNamingStrategy } from './mikro-orm.naming';

export default defineConfig({
  entities: ['./dist/domains/**/*.entity.js'],
  entitiesTs: ['./src/domains/**/*.entity.ts'],
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  metadataProvider: TsMorphMetadataProvider,
  namingStrategy: CamelCaseNamingStrategy,
  filters: {
    softDelete: {
      cond: { deletedAt: { $eq: null } },
      default: true,
    },
  },
  extensions: [SeedManager, EntityGenerator, Migrator],
  migrations: {
    path: path.resolve(__dirname, './migrations'),
    safe: true,
  },
  seeder: {
    path: path.resolve(__dirname, './seeders'),
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
  },
  debug: process.env.NODE_ENV !== 'development',
  highlighter: new SqlHighlighter(),
  ignoreUndefinedInQuery: true,
}) satisfies Options;
