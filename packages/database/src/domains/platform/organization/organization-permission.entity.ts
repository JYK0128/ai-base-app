import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Resource } from '../resource/resource.entity';
import { OrganizationRole } from './organization-role.entity';

@Entity({ schema: 'platform' })
export class OrganizationPermission extends CoreEntity<OrganizationPermission> {
  [EntityName]?: 'OrganizationPermission';

  @ManyToOne(() => OrganizationRole)
  role!: Rel<OrganizationRole>;

  @ManyToOne(() => Resource)
  resource!: Rel<Resource>;

  @Property({ type: 'string' })
  action!: string;

  @Property({ persist: false })
  get code(): Opt<string> {
    if (!this.resource.isInitialized()) {
      throw new Error('OrganizationPermission.resource is not populated');
    }
    return `${this.resource.code}:${this.action}`;
  }
}
