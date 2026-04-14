import type { Opt } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import { PlatformUser } from '../platform/platform.entity';

export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ schema: 'platform' })
export class Partner extends CoreEntity {
  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Enum(() => PartnerStatus)
  status: PartnerStatus & Opt = PartnerStatus.PENDING;

  @OneToMany(() => PlatformUser, (u) => u.partner)
  platformUsers = new Collection<PlatformUser>(this);
}
