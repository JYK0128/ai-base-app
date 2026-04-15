import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { Site } from '@/domains/site/site.entity';

export class SiteRepository extends BaseRepository<Site> {
  constructor(em: EntityManager) {
    super(em, Site);
  }
}

export const createSiteRepository = (
  em: EntityManager,
): SiteRepository => new SiteRepository(em);

export { createUserRepository,
  UserRepository } from '@/domains/site/site.user.repository';
export { createUserAccountRepository,
  UserAccountRepository } from '@/domains/site/site.user-account.repository';
