import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import { Partner } from '../partner/partner.entity';

@Entity({ schema: 'platform' })
export class PlatformAccount extends CoreEntity {
  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @OneToMany(() => PlatformUser, (u) => u.platformAccount)
  users = new Collection<PlatformUser>(this);
}

export enum PlatformRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_STAFF = 'PLATFORM_STAFF',
  PARTNER_ADMIN = 'PARTNER_ADMIN',
  PARTNER_STAFF = 'PARTNER_STAFF',
}

@Entity({ schema: 'platform' })
export class PlatformUser extends CoreEntity {
  @ManyToOne(() => PlatformAccount)
  platformAccount!: Rel<PlatformAccount>;

  @Enum(() => PlatformRole)
  role!: PlatformRole;

  @ManyToOne(() => Partner, { nullable: true })
  partner?: Rel<Partner>;
}
