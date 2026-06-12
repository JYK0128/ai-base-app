import { type Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { AuthKeyBuilder } from './auth-key.builder';

@Injectable()
export class AuthCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  static for(domain: string) {
    return AuthKeyBuilder.for(domain);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key);
    return value ?? null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const ttlMs = ttl ? ttl * 1000 : undefined;

    await this.cacheManager.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async ttl(key: string): Promise<number> {
    const ttlMs = await this.cacheManager.ttl(key);

    if (ttlMs === undefined) {
      return -2;
    }

    if (ttlMs < 0) {
      return -1;
    }

    return Math.ceil(ttlMs / 1000);
  }

  async incr(key: string, ttl?: number): Promise<number> {
    const current = Number((await this.get<number>(key)) ?? 0);
    const next = current + 1;
    const ttlMs = await this.cacheManager.ttl(key);
    let nextTtl: number | undefined;

    if (ttlMs && ttlMs > 0) {
      nextTtl = ttlMs;
    }
    else if (ttl) {
      nextTtl = ttl * 1000;
    }

    await this.cacheManager.set(key, next, nextTtl);

    return next;
  }
}
