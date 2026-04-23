import { hostname } from 'node:os';

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ENV } from '@/common/env';
import { ExceptionFilter } from '@/common/filters/exception.filter';
import { AuthGuard } from '@/common/guards/auth.guard';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { createClsMiddlewareOptions } from '@/common/middlewares/cls.middleware-options';
import { ContextMiddleware } from '@/common/middlewares/context.middleware';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: createClsMiddlewareOptions(),
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
    HealthModule,
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
      useClass: TransformInterceptor,
    },
    {
      provide: ContextMiddleware,
      useClass: ContextMiddleware,
    },
  ],
})
export class AppModule {
}
