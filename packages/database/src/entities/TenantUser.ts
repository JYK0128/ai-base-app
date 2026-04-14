import { Entity, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from './BaseEntity';

@Entity({ schema: 'tenant' })
export class TenantUser extends BaseEntity {
  @Property()
  tenantAccountId!: string; // Reference to Tenant Account

  @Property()
  tenantId!: string; // Reference to specific Partner (Tenant)

  @Property({ default: 'EndUser' })
  role: string = 'EndUser';
}
