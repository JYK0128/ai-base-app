export { createManagerAccountRepository,
  ManagerAccountRepository } from '@/domains/platform/platform.account.repository';
import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { Manager } from '@/domains/platform/platform.entity';

export class ManagerRepository extends BaseRepository<Manager> {
  constructor(em: EntityManager) {
    super(em, Manager);
  }
}

export const createManagerRepository = (
  em: EntityManager,
): ManagerRepository => new ManagerRepository(em);

export { createManagerInviteRepository,
  ManagerInviteRepository } from '@/domains/platform/platform.invite.repository';
