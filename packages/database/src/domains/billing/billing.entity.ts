import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { Order } from '@/domains/billing/billing.order.entity';
import { BaseEntity } from '@/domains/core/base.entity';
import type { Organization } from '@/domains/organization/organization.entity';

@Entity({ schema: 'billing' })
@Unique({ properties: ['organization'] })
export class OrganizationBillingProfile extends BaseEntity {
  @Index()
  @ManyToOne()
  organization!: Rel<Organization>;

  @Property()
  billingName!: string;

  @Property({ nullable: true })
  taxId?: string;

  @Property({ type: 'text' })
  billingAddress!: string;

  @Property({ length: 3, default: 'USD' })
  currency: string & Opt = 'USD';

  @Property({ nullable: true })
  billingEmail?: string;

  @OneToMany(() => Order, (order) => order.billingProfile)
  orders = new Collection<Order>(this);
}
