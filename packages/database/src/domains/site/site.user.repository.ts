import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { User } from '@/domains/site/site.user.entity';

export class UserRepository extends BaseRepository<User> {
  constructor(em: EntityManager) {
    super(em, User);
  }
}

export const createUserRepository = (
  em: EntityManager,
): UserRepository => new UserRepository(em);
