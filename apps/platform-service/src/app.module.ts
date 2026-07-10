import { hostname } from 'node:os';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { databaseConfig, entities } from '@pkg/database';
import cookieParser from 'cookie-parser';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ExceptionFilter } from '@/common/filters/exception.filter';
import { AuthGuard } from '@/common/guards/auth.guard';
import { HttpInterceptor } from '@/common/interceptors/http.interceptor';
import { ContextMiddleware } from '@/common/middlewares/context.middleware';
import { SessionMiddleware } from '@/common/middlewares/session.middleware';
import { SessionModule } from '@/common/modules/session.module';
import { doubleCsrfProtection } from '@/common/security/csrf';
import { AnnouncementModule } from '@/domains/announcement/announcement.module';
import { AuthModule } from '@/domains/auth/auth.module';
import { HealthModule } from '@/domains/health/health.module';
import { I18nModule } from '@/domains/i18n/i18n.module';
import { JoinModule } from '@/domains/join/join.module';
import { MailModule } from '@/domains/mail/mail.module';
import { MemberModule } from '@/domains/member/member.module';
import { OrganizationModule } from '@/domains/organization/organization.module';
import { ResourceModule } from '@/domains/resource/resource.module';
import { SignupModule } from '@/domains/signup/signup.module';
import { SupportModule } from '@/domains/support/support.module';
import { TermModule } from '@/domains/term/term.module';
import { ENV } from '@/env';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...databaseConfig,
      entities,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        ...(ENV.NODE_ENV !== 'production' ? { transport: { target: 'pino-pretty', options: { colorize: true } } } : {}),
        customLogLevel: (_req, res, err) => {
          if (err || res.statusCode >= 500) {
            return 'error';
          }
          if (res.statusCode >= 400) {
            return 'warn';
          }
          return 'info';
        },
        base: {
          env: ENV.NODE_ENV,
          host: hostname(),
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    SessionModule,
    AnnouncementModule,
    AuthModule,
    HealthModule,
    I18nModule,
    JoinModule,
    MailModule,
    MemberModule,
    OrganizationModule,
    SignupModule,
    ResourceModule,
    SupportModule,
    TermModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
    {
      provide: ContextMiddleware,
      useClass: ContextMiddleware,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware, cookieParser(), doubleCsrfProtection, ContextMiddleware).forRoutes('*');
  }
}
