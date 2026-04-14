import type { Opt } from '@mikro-orm/core';
import { Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

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
}
