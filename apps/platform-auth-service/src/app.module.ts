import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { EventLogInterceptor } from '@/common/interceptors/event-log.interceptor';
import { AuthModule } from '@/modules/auth/auth.module';
import { HealthModule } from '@/modules/health/health.module';

@Module({
  imports: [
    AuthModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EventLogInterceptor,
    },
  ],
})
export class AppModule {}
