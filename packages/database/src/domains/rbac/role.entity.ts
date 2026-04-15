import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import { ManagerRole } from './manager-role.entity';
import { RoleRepository } from './role.repository';
import { RolePermission } from './role-permission.entity';

export enum RbacRoleScope {
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
}

@Entity({ schema: 'platform', repository: () => RoleRepository })
export class Role extends CoreEntity<Role> {
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
