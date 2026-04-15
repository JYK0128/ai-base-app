import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Application } from './application.entity';
import { ApplicationPlanRepository } from './application.plan.repository';
import { ApplicationSubscription } from './application.subscription.entity';

@Entity({ schema: 'application', repository: () => ApplicationPlanRepository })
@Unique({ properties: ['application', 'code'] })
export class ApplicationPlan extends CoreEntity<ApplicationPlan> {
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
