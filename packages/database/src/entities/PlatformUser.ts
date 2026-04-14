import { Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

export enum PlatformRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_STAFF = 'PLATFORM_STAFF',
  PARTNER_ADMIN = 'PARTNER_ADMIN',
  PARTNER_STAFF = 'PARTNER_STAFF',
}

@Entity({ schema: 'platform' })
export class PlatformUser extends BaseEntity {
  @Property()
  platformAccountId!: string;

  @Enum(() => PlatformRole)
  role!: PlatformRole;

  @Property({ nullable: true })
  partnerId?: string;
}
