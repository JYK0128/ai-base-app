import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { ManagerAccount } from '@/domains/platform/platform.account.entity';

export class ManagerAccountRepository extends BaseRepository<ManagerAccount> {
  constructor(em: EntityManager) {
    super(em, ManagerAccount);
  }
}

export const createManagerAccountRepository = (
  em: EntityManager,
): ManagerAccountRepository => new ManagerAccountRepository(em);
