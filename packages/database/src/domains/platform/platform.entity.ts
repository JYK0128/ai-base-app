import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { Partner } from '@/domains/partner/partner.entity';

@Entity({ schema: 'platform' })
export class PlatformAccount extends BaseEntity {
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
export class PlatformUser extends BaseEntity {
  @ManyToOne(() => PlatformAccount)
  platformAccount!: Rel<PlatformAccount>;

  @Enum(() => PlatformRole)
  role!: PlatformRole;

  @ManyToOne({ nullable: true })
  partner?: Rel<Partner>;
}
