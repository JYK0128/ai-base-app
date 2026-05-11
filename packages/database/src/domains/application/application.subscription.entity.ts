import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Organization } from '../platform/organization/organization.entity';
import type { Application } from './application.entity';
import { ApplicationMembership } from './application.membership.entity';
import type { ApplicationPlan } from './application.plan.entity';
import { ApplicationSubscriptionRepository } from './application.subscription.repository';

export enum ApplicationSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

@Entity({ schema: 'application', repository: () => ApplicationSubscriptionRepository })
@Unique({ properties: ['customerOrganization', 'application'] })
export class ApplicationSubscription extends CoreEntity<ApplicationSubscription> {
  @Index()
  @ManyToOne()
  customerOrganization!: Rel<Organization>;

  @Index()
  @ManyToOne()
  application!: Rel<Application>;

  @Index()
  @ManyToOne()
  plan!: Rel<ApplicationPlan>;

  @Enum(() => ApplicationSubscriptionStatus)
  status: Opt<ApplicationSubscriptionStatus> = ApplicationSubscriptionStatus.ACTIVE;

  @Property()
  startedAt: Opt<Date> = new Date();

  @Property({ nullable: true })
  endedAt?: Date;

  @OneToMany(() => ApplicationMembership, (membership) => membership.subscription)
  memberships = new Collection<ApplicationMembership>(this);
}
