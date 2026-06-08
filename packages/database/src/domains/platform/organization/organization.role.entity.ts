import { Collection, EntityName, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Organization } from './organization.entity';
import { OrganizationPermission } from './organization.permission.entity';
import { OrganizationRoleRepository } from './organization.role.repository';
import { OrganizationRoleAssignment } from './organization.role-assignment.entity';

@Entity({ schema: 'platform', repository: () => OrganizationRoleRepository })
export class OrganizationRole extends CoreEntity<OrganizationRole> {
  [EntityName]?: 'OrganizationRole';

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;

  @Property({ type: 'string' })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', nullable: true })
  description?: string;

  @OneToMany(() => OrganizationPermission, (permission) => permission.role)
  permissions = new Collection<OrganizationPermission>(this);

  @OneToMany(() => OrganizationRoleAssignment, (assignment) => assignment.role)
  assignments = new Collection<OrganizationRoleAssignment>(this);
}
