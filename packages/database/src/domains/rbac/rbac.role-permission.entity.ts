import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { Role } from '@/domains/rbac/rbac.entity';
import type { Permission } from '@/domains/rbac/rbac.permission.entity';

@Entity({ schema: 'platform' })
@Unique({ properties: ['role', 'permission'] })
export class RolePermission extends BaseEntity {
  @ManyToOne()
  role!: Rel<Role>;

  @ManyToOne()
  permission!: Rel<Permission>;
}
