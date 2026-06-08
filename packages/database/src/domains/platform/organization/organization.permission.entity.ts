import { EntityName, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Resource } from '../resource/resource.entity';
import { OrganizationPermissionRepository } from './organization.permission.repository';
import { OrganizationRole } from './organization.role.entity';

@Entity({ schema: 'platform', repository: () => OrganizationPermissionRepository })
export class OrganizationPermission extends CoreEntity<OrganizationPermission> {
  [EntityName]?: 'OrganizationPermission';

  @ManyToOne(() => OrganizationRole)
  role!: Rel<OrganizationRole>;

  @ManyToOne(() => Resource)
  resource!: Rel<Resource>;

  @Property({ type: 'string' })
  action!: string;
}
