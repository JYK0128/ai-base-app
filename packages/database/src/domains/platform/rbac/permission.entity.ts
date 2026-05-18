import { Collection, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { PermissionRepository } from './permission.repository';
import { Resource } from './resource.entity';
import { RolePermission } from './role.permission.entity';

@Entity({ schema: 'platform', repository: () => PermissionRepository })
export class Permission extends CoreEntity<Permission> {
  @ManyToOne(() => Resource)
  resource!: Rel<Resource>;

  @Property()
  action!: string;

  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  roles = new Collection<RolePermission>(this);
}
