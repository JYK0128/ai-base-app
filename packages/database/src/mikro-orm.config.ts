import 'reflect-metadata';

import { GeneratedCacheAdapter, MetadataProvider } from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, EntityCaseNamingStrategy, type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import * as entities from './domains';
import metadata from './metadata.json' with { type: 'json' };

export default defineConfig({
  entities: Object.values(entities).filter((e) => typeof e === 'function'),
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  metadataProvider: process.env.MIKRO_ORM_CLI_TS_LOADER
    ? TsMorphMetadataProvider
    : MetadataProvider,
  metadataCache: {
    enabled: true,
    adapter: GeneratedCacheAdapter,
    options: { data: metadata, cacheDir: './src' },
  },
  namingStrategy: EntityCaseNamingStrategy,
  filters: {
    softDelete: {
      cond: { deletedAt: { $eq: null } },
      default: true,
    },
  },
  extensions: [SeedManager, EntityGenerator, Migrator],
  migrations: {
    path: './src/migrations',
    safe: true,
  },
  seeder: {
    path: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
  },
  debug: process.env.NODE_ENV !== 'production',
  highlighter: new SqlHighlighter(),
  ignoreUndefinedInQuery: true,
}) satisfies Options;
