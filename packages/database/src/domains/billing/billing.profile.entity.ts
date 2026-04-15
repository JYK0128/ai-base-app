import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Organization } from '../organization/organization.entity';
import { BillingOrder } from './billing.order.entity';
import { BillingProfileRepository } from './billing.profile.repository';

@Entity({ schema: 'billing', repository: () => BillingProfileRepository })
@Unique({ properties: ['organization'] })
export class BillingProfile extends CoreEntity<BillingProfile> {
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

  @OneToMany(() => BillingOrder, (order) => order.billingProfile)
  orders = new Collection<BillingOrder>(this);
}
