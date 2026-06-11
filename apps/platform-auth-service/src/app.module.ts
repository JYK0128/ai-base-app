import { hostname } from 'node:os';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { databaseConfig, entities } from '@pkg/database';
import { RpcContextInterceptor, RpcExceptionFilter, RpcLoggingInterceptor } from '@pkg/shared/server';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ENV } from '@/env';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';
import { RedisModule } from '@/modules/redis/redis.module';

const redisUrl = new URL(ENV.REDIS_URL);

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...databaseConfig,
      entities: entities,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: ENV.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        base: {
          env: ENV.NODE_ENV,
          host: hostname(),
        },
      },
    }),
    RedisModule.forRoot({
      host: redisUrl.hostname,
      port: Number(redisUrl.port),
      username: redisUrl.username,
      password: redisUrl.password,
      maxRetriesPerRequest: null,
    }),
    AuthModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
  ],
})
export class AppModule {}
