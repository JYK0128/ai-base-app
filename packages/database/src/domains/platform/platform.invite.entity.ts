import type { Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import type { Manager } from './platform.entity';
import { ManagerInviteRepository } from './platform.invite.repository';

export enum ManagerInviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
}

@Entity({ schema: 'platform', repository: () => ManagerInviteRepository })
@Unique({ properties: ['token'] })
export class ManagerInvite extends CoreEntity<ManagerInvite> {
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
