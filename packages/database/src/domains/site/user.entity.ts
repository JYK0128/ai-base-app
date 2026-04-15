import type { Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Site } from './site.entity';
import { UserRepository } from './user.repository';
import type { UserAccount } from './user.account.entity';

@Entity({ schema: 'site', repository: () => UserRepository })
@Unique({ properties: ['site', 'userAccount'] })
export class User extends CoreEntity<User> {
  @Index()
  @ManyToOne()
  site!: Rel<Site>;

  @Index()
  @ManyToOne()
  userAccount!: Rel<UserAccount>;

  @Property({ default: 'EndUser' })
  role: string = 'EndUser';
}
