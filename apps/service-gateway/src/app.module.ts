import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ENV } from './env';
import { EventLogInterceptor } from './event-log.interceptor';
import { HealthController } from './health.controller';

@Module({
  imports: [
    SentryModule.forRoot(),
    TerminusModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [ENV.RABBITMQ_URL],
          queue: 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // 추가
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EventLogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor, // 추가
    },
  ],
})
export class AppModule {}
