import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import { ManagerRole } from './rbac.manager-role.entity';
import { RbacRoleRepository } from './rbac.role.repository';
import { RolePermission } from './rbac.role-permission.entity';

export enum RbacRoleScope {
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
}

@Entity({ schema: 'platform', repository: () => RbacRoleRepository })
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
