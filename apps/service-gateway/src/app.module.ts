import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Request } from 'express';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';

import { ENV } from '@/common/env';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { AuthGuard } from '@/common/guards/auth.guard';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { ContextMiddleware } from '@/common/middlewares/context.middleware';
import { GatewayModule } from '@/modules/gateway/gateway.module';
import { HealthModule } from '@/modules/health/health.module';

import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: Request) => {
          const context = {
            traceId: (req.headers['x-trace-id'] as string) || randomUUID(),
            requestId: randomUUID(),
            sessionId: (req.cookies.sessionId as string) || '',
            ip: req.ip || '',
            realIp: (req.headers['x-real-ip'] as string) || req.ip || '',
            userAgent: (req.headers['user-agent'] as string) || '',
            referer: (req.headers['referer'] as string) || '',
            method: req.method,
            url: req.url,
            startTime: Date.now(),
            acceptLanguage: String(req.headers['accept-language'] || ''),
          };

          Object.entries(context).forEach(([key, value]) => {
            cls.set(key as keyof import('nestjs-cls').ClsStore, value);
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
    GatewayModule,
    HealthModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
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
