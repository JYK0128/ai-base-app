import type { Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import type { Manager } from './manager.entity';
import { ManagerInviteRepository } from './manager.invite.repository';

export enum ManagerInviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
}

@Entity({ schema: 'platform', repository: () => ManagerInviteRepository })
export class ManagerInvite
  extends CoreEntity<ManagerInvite, 'status'> {
  @ManyToOne()
  organization!: Rel<Organization>;

  @Property()
  token!: string;

  @Property()
  email!: string;

  @ManyToOne()
  invitedBy!: Rel<Manager>;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  acceptedAt?: Date;

  @Enum(() => ManagerInviteStatus)
  status: ManagerInviteStatus = ManagerInviteStatus.PENDING;
}
