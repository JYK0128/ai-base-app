import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum PlatformRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_STAFF = 'PLATFORM_STAFF',
  PARTNER_ADMIN = 'PARTNER_ADMIN',
  PARTNER_STAFF = 'PARTNER_STAFF',
}

@Entity({ tableName: 'platform_users' })
export class PlatformUser {
  @PrimaryKey()
  id!: string;

  @Property()
  platformAccountId!: string; // Reference to Platform Account

  @Enum(() => PlatformRole)
  role!: PlatformRole;

  @Property({ nullable: true })
  partnerId?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
