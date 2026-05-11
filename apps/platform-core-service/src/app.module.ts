import { hostname } from 'node:os';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { databaseConfig } from '@pkg/database';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ENV } from './common/env';
import { RpcExceptionFilter } from './common/filters/rpc-exception.filter';
import { RpcContextInterceptor } from './common/interceptors/rpc-context.interceptor';
import { RpcLoggingInterceptor } from './common/interceptors/rpc-logging.interceptor';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RedisModule } from './modules/redis/redis.module';
import { SupportModule } from './modules/support/support.module';
import { TermsModule } from './modules/terms/terms.module';

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
    RedisModule.forRoot({
      host: new URL(ENV.REDIS_URL).hostname,
      port: Number(new URL(ENV.REDIS_URL).port) || 6379,
      username: new URL(ENV.REDIS_URL).username || undefined,
      password: new URL(ENV.REDIS_URL).password || undefined,
      maxRetriesPerRequest: null,
    }),
    HealthModule,
    OrganizationModule,
    AnnouncementModule,
    SupportModule,
    TermsModule,
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
