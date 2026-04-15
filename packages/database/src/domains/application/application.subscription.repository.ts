import type { EntityManager } from '@mikro-orm/core';

import { ApplicationSubscription } from '@/domains/application/application.subscription.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class ApplicationSubscriptionRepository extends BaseRepository<ApplicationSubscription> {
  constructor(em: EntityManager) {
    super(em, ApplicationSubscription);
  }
}

export const createApplicationSubscriptionRepository = (
  em: EntityManager,
): ApplicationSubscriptionRepository => new ApplicationSubscriptionRepository(em);
