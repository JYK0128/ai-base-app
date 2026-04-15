import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity,
         Enum,
         Index,
         ManyToOne,
         OneToMany,
         Property,
         Unique } from '@mikro-orm/decorators/legacy';

import { ApplicationPlan } from '@/domains/application/application.plan.entity';
import { ApplicationRelease } from '@/domains/application/application.release.entity';
import { ApplicationSubscription } from '@/domains/application/application.subscription.entity';
import { BaseEntity } from '@/domains/core/base.entity';
import type { Organization } from '@/domains/organization/organization.entity';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ schema: 'application' })
@Unique({ properties: ['providerOrganization', 'code'] })
export class Application extends BaseEntity {
  @Index()
  @ManyToOne()
  providerOrganization!: Rel<Organization>;

  @Property()
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true, type: 'text' })
  description?: string;

  @Enum(() => ApplicationStatus)
  status: ApplicationStatus & Opt = ApplicationStatus.DRAFT;

  @OneToMany(() => ApplicationPlan, (plan) => plan.application)
  plans = new Collection<ApplicationPlan>(this);

  @OneToMany(() => ApplicationRelease, (release) => release.application)
  releases = new Collection<ApplicationRelease>(this);

  @OneToMany(() => ApplicationSubscription, (subscription) => subscription.application)
  subscriptions = new Collection<ApplicationSubscription>(this);
}
