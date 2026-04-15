import type { Rel } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';

@Entity({ schema: 'tenant' })
export class TenantAccount extends BaseEntity {
  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @OneToMany(() => TenantUser, (u) => u.tenantAccount)
  users = new Collection<TenantUser>(this);
}

@Entity({ schema: 'tenant' })
export class TenantUser extends BaseEntity {
  @ManyToOne(() => TenantAccount)
  tenantAccount!: Rel<TenantAccount>;

  @Property()
  tenantId!: string;

  @Property({ default: 'EndUser' })
  role: string = 'EndUser';
}
