import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { EventLogInterceptor } from '@/common/interceptors/event-log.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { GatewayModule } from '@/modules/gateway/gateway.module';
import { HealthModule } from '@/modules/health/health.module';

@Module({
  imports: [
    GatewayModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EventLogInterceptor,
    },
  ],
})
export class AppModule {}
