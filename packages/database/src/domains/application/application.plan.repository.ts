import type { EntityManager } from '@mikro-orm/core';

import { ApplicationPlan } from '@/domains/application/application.plan.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class ApplicationPlanRepository extends BaseRepository<ApplicationPlan> {
  constructor(em: EntityManager) {
    super(em, ApplicationPlan);
  }
}

export const createApplicationPlanRepository = (
  em: EntityManager,
): ApplicationPlanRepository => new ApplicationPlanRepository(em);
