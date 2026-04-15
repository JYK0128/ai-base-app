import { Collection } from '@mikro-orm/core';
import { Entity, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ManagerAccountRepository } from './manager.account.repository';
import { Manager } from './manager.entity';

@Entity({ schema: 'platform', repository: () => ManagerAccountRepository })
export class ManagerAccount extends CoreEntity<ManagerAccount> {
  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @OneToMany(() => Manager, (manager) => manager.managerAccount)
  managers = new Collection<Manager>(this);
}
