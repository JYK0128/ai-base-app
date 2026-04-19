import { hostname } from 'node:os';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { databaseConfig } from '@pkg/database';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { RpcExceptionFilter } from '@/common/filters/rpc-exception.filter';
import { RpcLoggingInterceptor } from '@/common/interceptors/rpc-logging.interceptor';
import { RpcTracingInterceptor } from '@/common/interceptors/rpc-tracing.interceptor';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';
import { RedisModule } from '@/modules/redis/redis.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(databaseConfig),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        base: {
          env: process.env.NODE_ENV || 'development',
          host: hostname(),
        },
      },
    }),
    RedisModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcTracingInterceptor,
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
