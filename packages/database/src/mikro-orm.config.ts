import 'reflect-metadata';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, EntityCaseNamingStrategy, type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default defineConfig({
  entities: ['./dist/domains'],
  entitiesTs: ['./src/domains'],
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  metadataProvider: TsMorphMetadataProvider,
  namingStrategy: EntityCaseNamingStrategy,
  filters: {
    softDelete: {
      cond: { deletedAt: { $eq: null } },
      default: true,
    },
  },
  extensions: [SeedManager, EntityGenerator, Migrator],
  migrations: {
    path: path.resolve(dirname, './migrations'),
    pathTs: path.resolve(dirname, './migrations'),
    glob: '!(*.d).{js,ts}',
    safe: true,
  },
  seeder: {
    path: path.resolve(dirname, './seeders'),
    pathTs: path.resolve(dirname, './seeders'),
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
  },
  debug: process.env.NODE_ENV !== 'development',
  highlighter: new SqlHighlighter(),
  ignoreUndefinedInQuery: true,
}) satisfies Options;
