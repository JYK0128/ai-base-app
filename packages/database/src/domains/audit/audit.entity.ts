import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import { AuditLogRepository } from './audit.repository';

export enum AuditEventType {
  MANAGER_ROLE_ASSIGNED = 'MANAGER_ROLE_ASSIGNED',
  MANAGER_ROLE_REVOKED = 'MANAGER_ROLE_REVOKED',
  SUBSCRIPTION_STATUS_CHANGED = 'SUBSCRIPTION_STATUS_CHANGED',
  USER_APPLICATION_JOINED = 'USER_APPLICATION_JOINED',
  USER_APPLICATION_WITHDRAWN = 'USER_APPLICATION_WITHDRAWN',
}

@Entity({ schema: 'audit', repository: () => AuditLogRepository })
export class AuditLog extends CoreEntity<AuditLog> {
  @Index()
  @Enum(() => AuditEventType)
  eventType!: AuditEventType;

  @Property()
  aggregateType!: string;

  @Index()
  @Property()
  aggregateId!: string;

  @Index()
  @ManyToOne({ nullable: true })
  organization?: Rel<Organization>;

  @Property({ nullable: true })
  actorManagerId?: string;

  @Property({ nullable: true })
  actorUserId?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @Property()
  occurredAt: Date & Opt = new Date();
}
