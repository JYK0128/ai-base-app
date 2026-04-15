import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Organization } from '../platform/organization/organization.entity';
import { ApplicationPlan } from './application.plan.entity';
import { ApplicationRelease } from './application.release.entity';
import { ApplicationRepository } from './application.repository';
import { ApplicationSubscription } from './application.subscription.entity';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ schema: 'application', repository: () => ApplicationRepository })
@Unique({ properties: ['providerOrganization', 'code'] })
export class Application extends CoreEntity<Application> {
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
