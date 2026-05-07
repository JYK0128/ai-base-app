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
  extends CoreEntity<ManagerAccount, 'status' | 'lockUntil' | 'passwordExpiresAt'> {
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

  @Property({ nullable: true })
  lockUntil?: Date | null;

  @Property({ nullable: true })
  passwordExpiresAt?: Date | null = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  @ManyToOne(() => Manager)
  manager!: Manager;
}
