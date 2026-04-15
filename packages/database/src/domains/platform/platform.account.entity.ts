import { Collection } from '@mikro-orm/core';
import { Entity, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { BaseEntity } from '@/domains/core/base.entity';
import { Manager } from '@/domains/platform/platform.entity';

@Entity({ schema: 'platform' })
export class ManagerAccount extends BaseEntity {
  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @OneToMany(() => Manager, (manager) => manager.managerAccount)
  managers = new Collection<Manager>(this);
}
