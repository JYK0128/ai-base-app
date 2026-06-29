import { type Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

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

  async update(key: string, value: number, ttl?: number): Promise<number> {
    const ttlMs = await this.cacheManager.ttl(key);
    const nextTtl = ttlMs || (ttl ? ttl * 1000 : ttl);
    await this.cacheManager.set(key, value, nextTtl);
    return value;
  }

  async incr(key: string, amount = 1, ttl?: number): Promise<number> {
    this.assertPositiveAmount(amount);
    const current = Number((await this.get<number>(key)) ?? 0);
    const next = current + amount;
    return this.update(key, next, ttl);
  }

  async decr(key: string, amount = 1, ttl?: number): Promise<number> {
    this.assertPositiveAmount(amount);
    const current = Number((await this.get<number>(key)) ?? 0);
    const next = Math.max(0, current - amount);
    return this.update(key, next, ttl);
  }

  private assertPositiveAmount(amount: number) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive integer');
    }
  }
}
