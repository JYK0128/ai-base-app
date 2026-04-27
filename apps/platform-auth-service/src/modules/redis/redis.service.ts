import { Inject, Injectable, Optional } from '@nestjs/common';
import { Redis } from 'ioredis';

import { REDIS_CLIENT, REDIS_FEATURE_OPTIONS } from './redis.constants';
import { RedisKeyBuilder } from './redis.key-builder';
import type { RedisFeatureOptions } from './redis.module';

@Injectable()
export class RedisService {
  private readonly namespace: string;

  /**
   * RedisService 생성자
   * @param redisClient 주입된 ioredis 클라이언트
   * @param options 네임스페이스 등 피처 옵션
   */
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
    @Optional()
    @Inject(REDIS_FEATURE_OPTIONS)
    private readonly options: RedisFeatureOptions = {},
  ) {
    this.namespace = options?.namespace ? `${options.namespace}:` : '';
  }

  /**
   * 네임스페이스가 포함된 최종 키를 생성합니다.
   */
  private createKey(key: string): string {
    return `${this.namespace}${key}`;
  }

  /**
   * 원본 ioredis 클라이언트를 반환합니다.
   */
  getClient(): Redis {
    return this.redisClient;
  }

  /**
   * 특정 도메인을 위한 키 빌더를 반환합니다.
   * @param domain 도메인명
   */
  static for(domain: string): RedisKeyBuilder {
    return RedisKeyBuilder.for(domain);
  }

  /**
   * 키에 해당하는 값을 가져옵니다.
   */
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(this.createKey(key));
  }

  /**
   * 키-값 쌍을 저장합니다.
   * @param key 저장할 키
   * @param value 저장할 값
   * @param ttl 만료 시간 (초 단위, 선택 사항)
   */
  async set(key: string, value: string, ttl?: number): Promise<string> {
    const finalKey = this.createKey(key);
    if (ttl) {
      return this.redisClient.set(finalKey, value, 'EX', ttl);
    }
    return this.redisClient.set(finalKey, value);
  }

  /**
   * 지정된 키를 삭제합니다.
   */
  async del(key: string): Promise<number> {
    return this.redisClient.del(this.createKey(key));
  }

  /**
   * 키의 숫자를 1 증가시킵니다.
   */
  async incr(key: string): Promise<number> {
    return this.redisClient.incr(this.createKey(key));
  }

  /**
   * 키의 만료 시간(TTL)을 설정합니다.
   * @param key 대상 키
   * @param ttl 만료 시간 (초 단위)
   */
  async expire(key: string, ttl: number): Promise<number> {
    return this.redisClient.expire(this.createKey(key), ttl);
  }

  /**
   * 키의 남은 만료 시간(TTL)을 조회합니다.
   * @returns 남은 시간 (초 단위, 키가 없으면 -2, 만료 시간이 없으면 -1)
   */
  async ttl(key: string): Promise<number> {
    return this.redisClient.ttl(this.createKey(key));
  }
}
