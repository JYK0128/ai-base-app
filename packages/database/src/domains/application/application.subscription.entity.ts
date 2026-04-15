import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import type { Application } from '@/domains/application/application.entity';
import { UserApplicationMembership } from '@/domains/application/application.membership.entity';
import type { ApplicationPlan } from '@/domains/application/application.plan.entity';
import { BaseEntity } from '@/domains/core/base.entity';
import type { Organization } from '@/domains/organization/organization.entity';

export enum ApplicationSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

@Entity({ schema: 'application' })
@Unique({ properties: ['customerOrganization', 'application'] })
export class ApplicationSubscription extends BaseEntity {
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
  status: ApplicationSubscriptionStatus & Opt = ApplicationSubscriptionStatus.ACTIVE;

  @Property()
  startedAt: Date & Opt = new Date();

  @Property({ nullable: true })
  endedAt?: Date;

  @OneToMany(() => UserApplicationMembership, (membership) => membership.subscription)
  memberships = new Collection<UserApplicationMembership>(this);
}
