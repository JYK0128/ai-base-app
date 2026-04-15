import { Collection } from '@mikro-orm/core';
import { Entity, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import { RbacPermissionRepository } from './rbac.permission.repository';
import { RolePermission } from './rbac.role-permission.entity';

@Entity({ schema: 'platform', repository: () => RbacPermissionRepository })
export class Permission extends CoreEntity<Permission> {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  roles = new Collection<RolePermission>(this);
}
