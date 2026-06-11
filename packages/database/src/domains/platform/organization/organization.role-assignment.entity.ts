import { EntityName, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Member } from '../member/member.entity';
import { Organization } from './organization.entity';
import { OrganizationRole } from './organization.role.entity';

@Entity({ schema: 'platform' })
export class OrganizationRoleAssignment extends CoreEntity<OrganizationRoleAssignment> {
  [EntityName]?: 'OrganizationRoleAssignment';

  @ManyToOne(() => Member)
  member!: Rel<Member>;

  @ManyToOne(() => OrganizationRole)
  role!: Rel<OrganizationRole>;

  @ManyToOne(() => Organization)
  organization!: Rel<Organization>;
}
