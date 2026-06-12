import { type Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Member, OrganizationRole } from '@pkg/database';

/**
 * 캐시 키 생성을 일관되게 관리하기 위한 유틸리티입니다.
 * 도메인:액션:식별자 구조를 생성합니다.
 */
export class AuthKeyBuilder {
  constructor(private readonly domain: string) {}

  static for(domain: string) {
    return new AuthKeyBuilder(domain);
  }

  build(action: string, value: string): string {
    return `${this.domain}:${action}:${value}`;
  }
}

@Injectable()
export class AuthService {
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
    await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
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

    await this.cacheManager.set(
      key,
      next,
      ttlMs && ttlMs > 0
        ? ttlMs
        : ttl
          ? ttl * 1000
          : undefined,
    );

    return next;
  }
}

/**
 * Member 엔티티에서 유효 역할 및 권한 목록을 추출합니다.
 */
export function extractPermissions(
  member: Member,
  organizationId?: string,
): { permissions: string[] } {
  if (!organizationId) {
    return {
      permissions: [],
    };
  }

  const permissions = new Set<string>();
  const organizationRoles = member.organizationRoles.getItems();

  for (const organizationRole of organizationRoles) {
    if (organizationRole.organization.id !== organizationId) {
      continue;
    }

    collectRolePermissions(organizationRole.role, permissions);
  }

  return {
    permissions: Array.from(permissions),
  };
}

function collectRolePermissions(role: OrganizationRole, permissions: Set<string>): void {
  for (const rp of role.permissions.getItems()) {
    permissions.add(`${rp.resource.code}:${rp.action}`);
  }
}
