import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import type { Application } from '@/domains/application/application.entity';
import { ApplicationSubscription } from '@/domains/application/application.subscription.entity';
import { BaseEntity } from '@/domains/core/base.entity';

@Entity({ schema: 'application' })
@Unique({ properties: ['application', 'code'] })
export class ApplicationPlan extends BaseEntity {
  @Index()
  @ManyToOne()
  application!: Rel<Application>;

  @Property()
  code!: string;

  @Property()
  name!: string;

  @Property({ default: 'MONTHLY' })
  billingCycle: string & Opt = 'MONTHLY';

  @Property({ type: 'decimal', precision: 14, scale: 2 })
  unitPrice!: string;

  @Property({ length: 3, default: 'USD' })
  currency: string & Opt = 'USD';

  @OneToMany(() => ApplicationSubscription, (subscription) => subscription.plan)
  subscriptions = new Collection<ApplicationSubscription>(this);
}
