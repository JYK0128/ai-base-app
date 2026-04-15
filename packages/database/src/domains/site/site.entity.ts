import type { Opt, Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../core/core.entity';
import { Organization } from '../platform/organization/organization.entity';
import { SiteRepository } from './site.repository';
import { User } from './user.entity';
import { UserAccount } from './user.account.entity';

@Entity({ schema: 'site', repository: () => SiteRepository })
@Unique({ properties: ['organization', 'code'] })
export class Site extends CoreEntity<Site> {
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
