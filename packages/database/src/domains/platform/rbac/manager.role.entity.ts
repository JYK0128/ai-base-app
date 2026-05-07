import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Manager } from '../manager/manager.entity';
import type { Organization } from '../organization/organization.entity';
import { ManagerRoleRepository } from './manager.role.repository';
import type { Role } from './role.entity';

@Entity({ schema: 'platform', repository: () => ManagerRoleRepository })
export class ManagerRole extends CoreEntity<ManagerRole> {
  @Index()
  @ManyToOne(() => Manager)
  manager!: Rel<Manager>;

  @Index()
  @ManyToOne()
  role!: Rel<Role>;

  @Index()
  @ManyToOne({ nullable: true })
  organization?: Rel<Organization>;
}
