import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { Partner } from '@/domains/partner/partner.entity';

export class PartnerRepository extends BaseRepository<Partner> {
  constructor(em: EntityManager) {
    super(em, Partner);
  }
}

export const createPartnerRepository = (
  em: EntityManager,
): PartnerRepository => new PartnerRepository(em);
