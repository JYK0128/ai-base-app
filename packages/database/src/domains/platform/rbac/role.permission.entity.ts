import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Resource } from './resource.entity';
import { Role } from './role.entity';
import { RolePermissionRepository } from './role.permission.repository';

@Entity({ schema: 'platform', repository: () => RolePermissionRepository })
export class RolePermission extends CoreEntity<RolePermission> {
  @ManyToOne(() => Role)
  role!: Rel<Role>;

  @ManyToOne(() => Resource)
  resource!: Rel<Resource>;

  @Property()
  action!: string;
}
