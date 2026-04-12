import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';

import { ENV } from './env';

@Controller('health')
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
      () => this.memory.checkHeap('memory_heap', { thresholdPercent: 0.98 }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () =>
        this.microservice.pingCheck('rabbitmq', {
          transport: Transport.RMQ,
          timeout: 3000,
          options: {
            urls: [ENV.RABBITMQ_URL],
            queue: 'auth_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
    ]);
  }
}
