import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import type { Site } from './site.entity';
import { UserAccountRepository } from './user.account.repository';
import { User } from './user.entity';

@Entity({ schema: 'site', repository: () => UserAccountRepository })
@Unique({ properties: ['site', 'email'] })
export class UserAccount extends CoreEntity<UserAccount> {
  @Index()
  @ManyToOne()
  site!: Rel<Site>;

  @Property()
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @OneToMany(() => User, (user) => user.userAccount)
  users = new Collection<User>(this);
}
