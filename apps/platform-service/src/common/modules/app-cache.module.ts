import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';

import { ENV } from '@/env';

import { AppCacheService } from '../services/app-cache.service';

@Module({})
export class AppCacheModule {
  static register(namespace = 'app'): DynamicModule {
    return {
      module: AppCacheModule,
      imports: [
        CacheModule.register({
          stores: [
            createKeyv(ENV.REDIS_URL, {
              namespace,
            }),
          ],
        }),
      ],
      providers: [AppCacheService],
      exports: [AppCacheService],
    };
  }
}
