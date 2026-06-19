import 'reflect-metadata';

import { MetadataProvider } from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, EntityCaseNamingStrategy, GeneratedCacheAdapter, type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

import metadata from './metadata.json' with { type: 'json' };
import { AuditSubscriber } from './subscribers';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export default defineConfig({
  entities: [
    'dist/domains/**/*.entity.js',
  ],
  entitiesTs: [
    'src/domains/**/*.entity.ts',
  ],
  driver: PostgreSqlDriver,
  clientUrl: databaseUrl,
  metadataProvider: process.env.MIKRO_ORM_CLI_TS_LOADER
    ? TsMorphMetadataProvider
    : MetadataProvider,
  metadataCache: {
    enabled: true,
    adapter: GeneratedCacheAdapter,
    options: {
      data: metadata,
      cacheDir: './src',
    },
  },
  namingStrategy: EntityCaseNamingStrategy,
  filters: {
    softDelete: {
      cond: { deletedAt: { $eq: null } },
      default: true,
    },
  },
  subscribers: [AuditSubscriber],
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
