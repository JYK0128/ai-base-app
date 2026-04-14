import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginHandler } from './commands/handlers/login.handler';
import { EventLogInterceptor } from './event-log.interceptor'; // 추가
import { AuditLogHandler } from './events/handlers/audit-log.handler';
import { HealthController } from './health.controller';
import { GetUserInfoHandler } from './queries/handlers/get-user-info.handler';

const Handlers = [LoginHandler, GetUserInfoHandler, AuditLogHandler];

@Module({
  imports: [
    CqrsModule,
    SentryModule.forRoot(),
    TerminusModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    ...Handlers,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EventLogInterceptor,
    },
  ],
})
export class AppModule {}
