import type { EntityManager } from '@mikro-orm/core';

import { Application } from '@/domains/application/application.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class ApplicationRepository extends BaseRepository<Application> {
  constructor(em: EntityManager) {
    super(em, Application);
  }
}

export const createApplicationRepository = (
  em: EntityManager,
): ApplicationRepository => new ApplicationRepository(em);

export { createUserApplicationMembershipRepository,
  UserApplicationMembershipRepository } from '@/domains/application/application.membership.repository';
export { ApplicationPlanRepository,
  createApplicationPlanRepository } from '@/domains/application/application.plan.repository';
export { ApplicationReleaseRepository,
  createApplicationReleaseRepository } from '@/domains/application/application.release.repository';
export { ApplicationSubscriptionRepository,
  createApplicationSubscriptionRepository } from '@/domains/application/application.subscription.repository';
