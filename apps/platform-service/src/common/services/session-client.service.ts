import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';

import { ENV } from '@/env';

@Injectable()
export class SessionClientService implements OnModuleInit, OnApplicationShutdown {
  readonly client: RedisClientType = createClient({
    url: ENV.REDIS_URL,
  });

  async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async onModuleInit() {
    await this.ensureConnected();
  }

  async onApplicationShutdown() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
