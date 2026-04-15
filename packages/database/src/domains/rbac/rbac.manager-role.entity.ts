import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import type { Role } from './rbac.entity';
import { ManagerRoleRepository } from './rbac.manager-role.repository';

@Entity({ schema: 'platform', repository: () => ManagerRoleRepository })
@Unique({ properties: ['managerId', 'role', 'organization'] })
export class ManagerRole extends CoreEntity<ManagerRole> {
  @Index()
  @Property()
  managerId!: string;

  @Index()
  @ManyToOne()
  role!: Rel<Role>;

  @Index()
  @ManyToOne({ nullable: true })
  organization?: Rel<Organization>;
}
