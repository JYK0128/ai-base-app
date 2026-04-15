import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import { ManagerRole } from '@/domains/rbac/rbac.manager-role.entity';
import { RolePermission } from '@/domains/rbac/rbac.role-permission.entity';

export enum RbacRoleScope {
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
}

@Entity({ schema: 'platform' })
export class Role extends BaseEntity {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Index()
  @Enum(() => RbacRoleScope)
  scope: RbacRoleScope = RbacRoleScope.PLATFORM;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  permissions = new Collection<RolePermission>(this);

  @OneToMany(() => ManagerRole, (mr) => mr.role)
  managerRoles = new Collection<ManagerRole>(this);
}
