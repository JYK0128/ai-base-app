import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Application } from './application.entity';
import { ApplicationMembership } from './application.membership.entity';
import { ApplicationReleaseRepository } from './application.release.repository';

@Entity({ schema: 'application', repository: () => ApplicationReleaseRepository })
@Unique({ properties: ['application', 'version'] })
export class ApplicationRelease extends CoreEntity<ApplicationRelease> {
  @Index()
  @ManyToOne()
  application!: Rel<Application>;

  @Property()
  version!: string;

  @Property({ nullable: true, type: 'text' })
  releaseNote?: string;

  @Property({ default: false })
  isStable: Opt<boolean> = false;

  @OneToMany(() => ApplicationMembership, (membership) => membership.release)
  memberships = new Collection<ApplicationMembership>(this);
}
