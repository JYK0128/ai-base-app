import type { EntityManager } from '@mikro-orm/core';

import { UserApplicationMembership } from '@/domains/application/application.membership.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class UserApplicationMembershipRepository extends BaseRepository<UserApplicationMembership> {
  constructor(em: EntityManager) {
    super(em, UserApplicationMembership);
  }
}

export const createUserApplicationMembershipRepository = (
  em: EntityManager,
): UserApplicationMembershipRepository => new UserApplicationMembershipRepository(em);
