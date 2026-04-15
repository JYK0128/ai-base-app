import type { EntityManager } from '@mikro-orm/core';

import { AuditLog } from '@/domains/audit/audit.entity';
import { BaseRepository } from '@/domains/core/base.repository';

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(em: EntityManager) {
    super(em, AuditLog);
  }
}

export const createAuditLogRepository = (
  em: EntityManager,
): AuditLogRepository => new AuditLogRepository(em);
