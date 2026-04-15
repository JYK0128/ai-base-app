import { Collection } from '@mikro-orm/core';
import { Entity, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import { RolePermission } from '@/domains/rbac/rbac.role-permission.entity';

@Entity({ schema: 'platform' })
export class Permission extends BaseEntity {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  roles = new Collection<RolePermission>(this);
}
