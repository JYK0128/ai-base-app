import type { Opt, Rel } from '@mikro-orm/core';
import { Entity, Enum, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { User } from '../site/user.entity';
import { ApplicationMembershipRepository } from './application.membership.repository';
import type { ApplicationRelease } from './application.release.entity';
import type { ApplicationSubscription } from './application.subscription.entity';

export enum UserApplicationMembershipStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  WITHDRAWN = 'WITHDRAWN',
  TERMINATED = 'TERMINATED',
}

@Entity({ schema: 'application', repository: () => ApplicationMembershipRepository })
@Unique({ properties: ['subscription', 'user'] })
export class ApplicationMembership extends CoreEntity<ApplicationMembership> {
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
