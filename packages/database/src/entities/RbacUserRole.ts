import { Entity, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

@Entity({ schema: 'platform' })
@Unique({ properties: ['userId', 'roleId', 'tenantId'] })
export class RbacUserRole extends BaseEntity {
  @Property()
  userId!: string;

  @Property()
  roleId!: string;

  @Property({ nullable: true })
  tenantId?: string;
}
