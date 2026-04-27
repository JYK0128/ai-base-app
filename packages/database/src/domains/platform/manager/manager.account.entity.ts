import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ManagerAccountRepository } from './manager.account.repository';
import { Manager } from './manager.entity';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ schema: 'platform', repository: () => ManagerAccountRepository })
export class ManagerAccount
  extends CoreEntity<ManagerAccount, 'status' | 'passwordChangedAt' | 'nextPasswordChangeAt' | 'forcePasswordChange'> {
  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property({ nullable: true })
  lastLoginAt?: Date | null;

  @Property({ nullable: true })
  lastLoginIp?: string | null;

  @Enum(() => AccountStatus)
  status: AccountStatus = AccountStatus.ACTIVE;



  @Property()
  passwordChangedAt: Date = new Date();

  @Property()
  nextPasswordChangeAt: Date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  @Property()
  forcePasswordChange: boolean = false;

  @ManyToOne(() => Manager)
  manager!: Manager;
}
