import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { Site } from '@/domains/site/site.entity';
import type { UserAccount } from '@/domains/site/site.user-account.entity';

@Entity({ schema: 'site' })
@Unique({ properties: ['site', 'userAccount'] })
export class User extends BaseEntity {
  @Index()
  @ManyToOne()
  site!: Rel<Site>;

  @Index()
  @ManyToOne()
  userAccount!: Rel<UserAccount>;

  @Property({ default: 'EndUser' })
  role: string = 'EndUser';
}
