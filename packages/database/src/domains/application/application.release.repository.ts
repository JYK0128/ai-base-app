import type { EntityManager } from '@mikro-orm/core';

import { ApplicationRelease } from '@/domains/application/application.release.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class ApplicationReleaseRepository extends BaseRepository<ApplicationRelease> {
  constructor(em: EntityManager) {
    super(em, ApplicationRelease);
  }
}

export const createApplicationReleaseRepository = (
  em: EntityManager,
): ApplicationReleaseRepository => new ApplicationReleaseRepository(em);
