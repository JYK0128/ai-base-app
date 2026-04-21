import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Request } from 'express';
import { ClsModule, type ClsStore } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ENV } from '@/common/env';
import { ExceptionFilter } from '@/common/filters/exception.filter';
import { AuthGuard } from '@/common/guards/auth.guard';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { ContextMiddleware } from '@/common/middlewares/context.middleware';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: Request) => {
          const context: ClsStore = {
            traceId: String(req.headers['x-trace-id'] || randomUUID()),
            requestId: randomUUID(),
            sessionId: String(req.cookies.sessionId || ''),
            ip: req.ip || '',
            realIp: String(req.headers['x-real-ip'] || req.ip || ''),
            userAgent: String(req.headers['user-agent'] || ''),
            referer: String(req.headers['referer'] || ''),
            method: req.method,
            url: req.url,
            startTime: Date.now(),
            acceptLanguage: String(req.headers['accept-language'] || ''),
          };

          Object.entries(context).forEach(([key, value]) => {
            cls.set(key as keyof ClsStore, value);
          });
        },
      },
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
