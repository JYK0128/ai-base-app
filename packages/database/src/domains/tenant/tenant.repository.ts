import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { TenantAccount, TenantUser } from '@/domains/tenant/tenant.entity';

export class TenantAccountRepository extends BaseRepository<TenantAccount> {
  constructor(em: EntityManager) {
    super(em, TenantAccount);
  }
}

export class TenantUserRepository extends BaseRepository<TenantUser> {
  constructor(em: EntityManager) {
    super(em, TenantUser);
  }
}

export const createTenantAccountRepository = (
  em: EntityManager,
): TenantAccountRepository => new TenantAccountRepository(em);

export const createTenantUserRepository = (
  em: EntityManager,
): TenantUserRepository => new TenantUserRepository(em);
