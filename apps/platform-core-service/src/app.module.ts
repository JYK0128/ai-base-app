import { hostname } from 'node:os';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { databaseConfig } from '@pkg/database';
import { RpcContextInterceptor, RpcExceptionFilter, RpcLoggingInterceptor } from '@pkg/shared/server';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ENV } from './env';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { HealthModule } from './modules/health/health.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { MailModule } from './modules/mail/mail.module';
import { MembersModule } from './modules/members/members.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { RedisModule } from './modules/redis/redis.module';
import { ResourceModule } from './modules/resource/resource.module';
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
    I18nModule,
    OrganizationModule,
    AnnouncementModule,
    SupportModule,
    TermsModule,
    MailModule,
    MembersModule,
    ResourceModule,
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
