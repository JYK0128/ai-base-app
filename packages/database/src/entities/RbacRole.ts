import type { Opt } from '@mikro-orm/core';
import { Entity, Enum, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

export enum RbacRoleScope {
  PLATFORM = 'PLATFORM',
  TENANT = 'TENANT',
}

@Entity({ schema: 'platform' })
export class RbacRole extends BaseEntity {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Enum(() => RbacRoleScope)
  scope: RbacRoleScope & Opt = RbacRoleScope.PLATFORM;
}
