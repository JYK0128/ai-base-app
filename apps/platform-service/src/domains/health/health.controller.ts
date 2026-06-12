import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { DiskHealthIndicator, HealthCheck, HealthCheckService, MemoryHealthIndicator, MicroserviceHealthIndicator, MikroOrmHealthIndicator } from '@nestjs/terminus';

import { Public } from '@/common/decorators/public.decorator';
import { ENV } from '@/env';

const redisUrl = new URL(ENV.REDIS_URL);

@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
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
          host: redisUrl.hostname,
          port: Number(redisUrl.port),
        },
      }),
      () => this.microservice.pingCheck('rabbitmq', {
        transport: Transport.RMQ,
        options: {
          urls: [ENV.RABBITMQ_URL],
          queue: 'health_check',
          queueOptions: {
            durable: false,
          },
        },
      }),
      () => this.microservice.pingCheck('kafka', {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [ENV.KAFKA_URL],
            clientId: 'health-check',
          },
        },
      }),
      () => this.disk.checkStorage('disk', {
        path: '/',
        thresholdPercent: 0.9,
      }),
      () => this.memory.checkRSS('memory_rss',
        512 * 1024 * 1024,
      ),
    ]);
  }
}
