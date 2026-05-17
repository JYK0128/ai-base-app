import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Manager } from '../manager/manager.entity';
import type { Organization } from '../organization/organization.entity';
import { ManagerRoleRepository } from './manager.role.repository';
import type { Role } from './role.entity';

@Entity({ schema: 'platform', repository: () => ManagerRoleRepository })
export class ManagerRole
  extends CoreEntity<ManagerRole> {
  @ManyToOne(() => Manager)
  manager!: Rel<Manager>;

  @ManyToOne()
  role!: Rel<Role>;

  @ManyToOne({ nullable: true })
  organization?: Rel<Organization>;
}
