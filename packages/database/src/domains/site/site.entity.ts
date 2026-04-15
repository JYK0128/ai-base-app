import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import { Organization } from '@/domains/organization/organization.entity';
import { User } from '@/domains/site/site.user.entity';
import { UserAccount } from '@/domains/site/site.user-account.entity';

@Entity({ schema: 'site' })
@Unique({ properties: ['organization', 'code'] })
export class Site extends BaseEntity {
  @Index()
  @ManyToOne()
  organization!: Rel<Organization>;

  @Property()
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ default: true })
  isActive: boolean & Opt = true;

  @OneToMany(() => UserAccount, (account) => account.site)
  accounts = new Collection<UserAccount>(this);

  @OneToMany(() => User, (user) => user.site)
  users = new Collection<User>(this);
}
