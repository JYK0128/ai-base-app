import 'reflect-metadata';
import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Partner } from './entities/Partner';
import { PlatformAccount } from './entities/PlatformAccount';
import { PlatformUser } from './entities/PlatformUser';
import { TenantAccount } from './entities/TenantAccount';
import { TenantUser } from './entities/TenantUser';
import { Outbox } from './entities/Outbox';

export default defineConfig({
  entities: [Partner, PlatformAccount, PlatformUser, TenantAccount, TenantUser, Outbox],
  dbName: 'platform_db',
  metadataProvider: TsMorphMetadataProvider,
  user: 'postgres',
  password: 'postgrespassword',
  host: 'localhost',
  port: 5432,
  discovery: {
    warnWhenNoEntities: true,
  },
});
