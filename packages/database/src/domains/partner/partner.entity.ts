import type { Opt } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { PlatformUser } from '@/domains/platform/platform.entity';

export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ schema: 'platform' })
export class Partner extends BaseEntity {
  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Enum(() => PartnerStatus)
  status: PartnerStatus & Opt = PartnerStatus.PENDING;

  @OneToMany({ mappedBy: 'partner' })
  platformUsers = new Collection<PlatformUser>(this);
}
