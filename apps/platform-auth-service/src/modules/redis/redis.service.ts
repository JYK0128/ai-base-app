import { Inject, Injectable, Optional } from '@nestjs/common';
import { Redis } from 'ioredis';

import { REDIS_CLIENT, REDIS_FEATURE_OPTIONS } from './redis.constants';
import type { RedisFeatureOptions } from './redis.module';

@Injectable()
export class RedisService {
  private readonly namespace: string;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
    @Optional()
    @Inject(REDIS_FEATURE_OPTIONS)
    private readonly options: RedisFeatureOptions = {},
  ) {
    this.namespace = options?.namespace ? `${options.namespace}:` : '';
  }

  private createKey(key: string): string {
    return `${this.namespace}${key}`;
  }

  getClient(): Redis {
    return this.redisClient;
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(this.createKey(key));
  }

  async set(key: string, value: string, ttl?: number): Promise<string> {
    const finalKey = this.createKey(key);
    if (ttl) {
      return this.redisClient.set(finalKey, value, 'EX', ttl);
    }
    return this.redisClient.set(finalKey, value);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(this.createKey(key));
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(this.createKey(key));
  }

  async expire(key: string, ttl: number): Promise<number> {
    return this.redisClient.expire(this.createKey(key), ttl);
  }

  async ttl(key: string): Promise<number> {
    return this.redisClient.ttl(this.createKey(key));
  }
}
