import { hostname } from 'node:os';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type {} from '@pkg/shared/common';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ExceptionFilter } from '@/common/filters/exception.filter';
import { AuthGuard } from '@/common/guards/auth.guard';
import { TraceInterceptor } from '@/common/interceptors/trace.interceptor';
import { ContextMiddleware } from '@/common/middlewares/context.middleware';
import { ENV } from '@/env';
import { AnnouncementsModule } from '@/modules/announcements/announcements.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';
import { I18nModule } from '@/modules/i18n/i18n.module';
import { MembersModule } from '@/modules/members/members.module';
import { OrganizationsModule } from '@/modules/organizations/organizations.module';
import { ResourceModule } from '@/modules/resource/resource.module';
import { SupportModule } from '@/modules/support/support.module';
import { TermsModule } from '@/modules/terms/terms.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
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
          env: process.env.NODE_ENV || 'development',
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
    JwtModule.register({
      global: true,
      secret: ENV.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN },
    }),
    AuthModule,
    AnnouncementsModule,
    I18nModule,
    HealthModule,
    MembersModule,
    OrganizationsModule,
    ResourceModule,
    SupportModule,
    TermsModule,
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
      useClass: TraceInterceptor,
    },
    {
      provide: ContextMiddleware,
      useClass: ContextMiddleware,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
