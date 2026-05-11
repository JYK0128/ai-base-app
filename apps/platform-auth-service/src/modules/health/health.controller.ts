import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { HealthCheck,
         HealthCheckService,
         MemoryHealthIndicator,
         MicroserviceHealthIndicator,
         MikroOrmHealthIndicator } from '@nestjs/terminus';

import { ENV } from '../../common/env';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly db: MikroOrmHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
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
      () => this.db.pingCheck('database', { timeout: 1500 }),
      () => this.microservice.pingCheck('redis', {
        transport: Transport.REDIS,
        options: {
          url: ENV.REDIS_URL,
        },
      }),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
