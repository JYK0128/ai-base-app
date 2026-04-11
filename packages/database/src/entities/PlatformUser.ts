import type { Opt } from '@mikro-orm/core';
import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

export enum PlatformRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_STAFF = 'PLATFORM_STAFF',
  PARTNER_ADMIN = 'PARTNER_ADMIN',
  PARTNER_STAFF = 'PARTNER_STAFF',
}

@Entity({ schema: 'platform' })
export class PlatformUser {
  @PrimaryKey()
  id!: string;

  @Property()
  platformAccountId!: string;

  @Enum(() => PlatformRole)
  role!: PlatformRole;

  @Property({ nullable: true })
  partnerId?: string;

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
