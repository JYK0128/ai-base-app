import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { ManagerInvite } from '@/domains/platform/platform.invite.entity';

export class ManagerInviteRepository extends BaseRepository<ManagerInvite> {
  constructor(em: EntityManager) {
    super(em, ManagerInvite);
  }
}

export const createManagerInviteRepository = (
  em: EntityManager,
): ManagerInviteRepository => new ManagerInviteRepository(em);
