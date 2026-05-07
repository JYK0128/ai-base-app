import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Organization } from '../platform/organization/organization.entity';
import { AuditRepository } from './audit.repository';

export enum AuditEventType {
  MANAGER_ROLE_ASSIGNED = 'MANAGER_ROLE_ASSIGNED',
  MANAGER_ROLE_REVOKED = 'MANAGER_ROLE_REVOKED',
  SUBSCRIPTION_STATUS_CHANGED = 'SUBSCRIPTION_STATUS_CHANGED',
  USER_APPLICATION_JOINED = 'USER_APPLICATION_JOINED',
  USER_APPLICATION_WITHDRAWN = 'USER_APPLICATION_WITHDRAWN',
}

@Entity({ schema: 'audit', repository: () => AuditRepository })
export class Audit extends CoreEntity<Audit> {
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

  @Property()
  occurredAt: Date & Opt = new Date();
}
