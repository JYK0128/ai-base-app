import type { EntityManager } from '@mikro-orm/core';

import { BaseRepository } from '@/domains/core/base.repository';
import { Organization } from '@/domains/organization/organization.entity';

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor(em: EntityManager) {
    super(em, Organization);
  }
}

export const createOrganizationRepository = (
  em: EntityManager,
): OrganizationRepository => new OrganizationRepository(em);
