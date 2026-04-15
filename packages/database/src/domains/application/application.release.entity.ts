import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import type { Application } from '@/domains/application/application.entity';
import { UserApplicationMembership } from '@/domains/application/application.membership.entity';
import { BaseEntity } from '@/domains/core/base.entity';

@Entity({ schema: 'application' })
@Unique({ properties: ['application', 'version'] })
export class ApplicationRelease extends BaseEntity {
  @Index()
  @ManyToOne()
  application!: Rel<Application>;

  @Property()
  version!: string;

  @Property({ nullable: true, type: 'text' })
  releaseNote?: string;

  @Property({ default: false })
  isStable: boolean & Opt = false;

  @OneToMany(() => UserApplicationMembership, (membership) => membership.release)
  memberships = new Collection<UserApplicationMembership>(this);
}
