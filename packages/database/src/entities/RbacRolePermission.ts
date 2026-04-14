import { Entity, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

@Entity({ schema: 'platform' })
@Unique({ properties: ['roleId', 'permissionId'] })
export class RbacRolePermission extends BaseEntity {
  @Property()
  roleId!: string;

  @Property()
  permissionId!: string;
}
