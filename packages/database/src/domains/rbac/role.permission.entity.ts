import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Permission } from './permission.entity';
import type { Role } from './role.entity';
import { RolePermissionRepository } from './role.permission.repository';

@Entity({ schema: 'platform', repository: () => RolePermissionRepository })
@Unique({ properties: ['role', 'permission'] })
export class RolePermission extends CoreEntity<RolePermission> {
  @ManyToOne()
  role!: Rel<Role>;

  @ManyToOne()
  permission!: Rel<Permission>;
}
