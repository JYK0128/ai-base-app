import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { HealthCheck,
         HealthCheckService,
         MemoryHealthIndicator,
         MicroserviceHealthIndicator } from '@nestjs/terminus';

import { Public } from '@/common/decorators/public.decorator';
import { ENV } from '@/common/env';

@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () =>
        this.microservice.pingCheck('auth-service', {
          transport: Transport.TCP,
          options: {
            host: ENV.AUTH_SERVICE_HOST,
            port: ENV.AUTH_SERVICE_PORT,
          },
        }),
    ]);
  }
}
