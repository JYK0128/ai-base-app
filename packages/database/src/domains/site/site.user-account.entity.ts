import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import type { Site } from '@/domains/site/site.entity';
import { User } from '@/domains/site/site.user.entity';

@Entity({ schema: 'site' })
@Unique({ properties: ['site', 'email'] })
export class UserAccount extends BaseEntity {
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
