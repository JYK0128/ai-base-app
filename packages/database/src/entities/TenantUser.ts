import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'tenant_users' })
export class TenantUser {
  @PrimaryKey()
  id!: string;

  @Property()
  tenantAccountId!: string; // Reference to Tenant Account

  @Property()
  tenantId!: string; // Reference to specific Partner (Tenant)

  @Property({ default: 'EndUser' })
  role: string = 'EndUser';

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
