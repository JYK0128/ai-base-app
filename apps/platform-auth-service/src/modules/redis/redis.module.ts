import { DynamicModule, Module, Provider } from '@nestjs/common';
import Redis, { type RedisOptions } from 'ioredis';

import { REDIS_CLIENT, REDIS_FEATURE_OPTIONS } from './redis.constants';
import { RedisService } from './redis.service';

export interface RedisFeatureOptions {
  namespace?: string
}

@Module({})
export class RedisModule {
  static forRoot(options: RedisOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis(options);
      },
    };

    return {
      module: RedisModule,
      global: true,
      providers: [redisProvider, RedisService],
      exports: [REDIS_CLIENT, RedisService],
    };
  }

  static forFeature(options: RedisFeatureOptions = {}): DynamicModule {
    const featureOptionsProvider: Provider = {
      provide: REDIS_FEATURE_OPTIONS,
      useValue: options,
    };

    const serviceProvider: Provider = {
      provide: RedisService,
      useFactory: (client: Redis, featOptions: RedisFeatureOptions) => {
        return new RedisService(client, featOptions);
      },
      inject: [REDIS_CLIENT, REDIS_FEATURE_OPTIONS],
    };

    return {
      module: RedisModule,
      providers: [featureOptionsProvider, serviceProvider],
      exports: [serviceProvider],
    };
  }
}
