import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';

export enum RbacRoleScope {
  PLATFORM = 'PLATFORM',
  TENANT = 'TENANT',
}

@Entity({ schema: 'platform' })
export class RbacRole extends CoreEntity {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Enum(() => RbacRoleScope)
  scope: RbacRoleScope = RbacRoleScope.PLATFORM;

  @OneToMany(() => RbacRolePermission, (rp) => rp.role)
  permissions = new Collection<RbacRolePermission>(this);

  @OneToMany(() => RbacUserRole, (ur) => ur.role)
  userRoles = new Collection<RbacUserRole>(this);
}

@Entity({ schema: 'platform' })
export class RbacPermission extends CoreEntity {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => RbacRolePermission, (rp) => rp.permission)
  roles = new Collection<RbacRolePermission>(this);
}

@Entity({ schema: 'platform' })
@Unique({ properties: ['role', 'permission'] })
export class RbacRolePermission extends CoreEntity {
  @ManyToOne(() => RbacRole)
  role!: Rel<RbacRole>;

  @ManyToOne(() => RbacPermission)
  permission!: Rel<RbacPermission>;
}

@Entity({ schema: 'platform' })
@Unique({ properties: ['userId', 'role', 'tenantId'] })
export class RbacUserRole extends CoreEntity {
  @Property()
  userId!: string;

  @ManyToOne(() => RbacRole)
  role!: Rel<RbacRole>;

  @Property({ nullable: true })
  tenantId?: string;
}
