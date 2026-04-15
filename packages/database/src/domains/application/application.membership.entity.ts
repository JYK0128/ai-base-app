import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import type { ApplicationRelease } from '@/domains/application/application.release.entity';
import type { ApplicationSubscription } from '@/domains/application/application.subscription.entity';
import { BaseEntity } from '@/domains/core/base.entity';
import type { User } from '@/domains/site/site.user.entity';

export enum UserApplicationMembershipStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  WITHDRAWN = 'WITHDRAWN',
  TERMINATED = 'TERMINATED',
}

@Entity({ schema: 'application' })
@Unique({ properties: ['subscription', 'user'] })
export class UserApplicationMembership extends BaseEntity {
  @Index()
  @ManyToOne()
  subscription!: Rel<ApplicationSubscription>;

  @Index()
  @ManyToOne()
  user!: Rel<User>;

  @Index()
  @ManyToOne({ nullable: true })
  release?: Rel<ApplicationRelease>;

  @Enum(() => UserApplicationMembershipStatus)
  status: UserApplicationMembershipStatus & Opt = UserApplicationMembershipStatus.ACTIVE;

  @Property()
  joinedAt: Date & Opt = new Date();

  @Property({ nullable: true })
  leftAt?: Date;
}
