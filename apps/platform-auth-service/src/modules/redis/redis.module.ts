import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

import { ENV } from '@/common/env';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(ENV.REDIS_URL, {
          maxRetriesPerRequest: null,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
