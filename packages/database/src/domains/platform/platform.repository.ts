import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { PlatformAccount, PlatformUser } from '@/domains/platform/platform.entity';

export class PlatformAccountRepository extends BaseRepository<PlatformAccount> {
  constructor(em: EntityManager) {
    super(em, PlatformAccount);
  }
}

export class PlatformUserRepository extends BaseRepository<PlatformUser> {
  constructor(em: EntityManager) {
    super(em, PlatformUser);
  }
}

export const createPlatformAccountRepository = (
  em: EntityManager,
): PlatformAccountRepository => new PlatformAccountRepository(em);

export const createPlatformUserRepository = (
  em: EntityManager,
): PlatformUserRepository => new PlatformUserRepository(em);
