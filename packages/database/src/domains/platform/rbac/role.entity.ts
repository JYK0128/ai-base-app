import { Collection } from '@mikro-orm/core';
import { Entity, Enum, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ManagerRole } from './manager.role.entity';
import { RolePermission } from './role.permission.entity';
import { RoleRepository } from './role.repository';

export enum RbacRoleScope {
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
}

@Entity({ schema: 'platform', repository: () => RoleRepository })
export class Role
  extends CoreEntity<Role, 'scope'> {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Enum(() => RbacRoleScope)
  scope: RbacRoleScope = RbacRoleScope.PLATFORM;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  permissions = new Collection<RolePermission>(this);

  @OneToMany(() => ManagerRole, (mr) => mr.role)
  managerRoles = new Collection<ManagerRole>(this);
}
