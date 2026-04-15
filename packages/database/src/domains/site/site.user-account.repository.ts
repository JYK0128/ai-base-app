import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { UserAccount } from '@/domains/site/site.user-account.entity';

export class UserAccountRepository extends BaseRepository<UserAccount> {
  constructor(em: EntityManager) {
    super(em, UserAccount);
  }
}

export const createUserAccountRepository = (
  em: EntityManager,
): UserAccountRepository => new UserAccountRepository(em);
