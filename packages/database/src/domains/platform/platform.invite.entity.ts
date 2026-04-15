import type { Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { Organization } from '@/domains/organization/organization.entity';
import type { Manager } from '@/domains/platform/platform.entity';

export enum ManagerInviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
}

@Entity({ schema: 'platform' })
@Unique({ properties: ['token'] })
export class ManagerInvite extends BaseEntity {
  @Index()
  @ManyToOne()
  organization!: Rel<Organization>;

  @Property()
  token!: string;

  @Property()
  email!: string;

  @Index()
  @ManyToOne()
  invitedBy!: Rel<Manager>;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  acceptedAt?: Date;

  @Enum(() => ManagerInviteStatus)
  status: ManagerInviteStatus = ManagerInviteStatus.PENDING;
}
