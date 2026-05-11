import type { Rel } from '@mikro-orm/core';
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
  manager!: Rel<Manager>;

  /**
   * 비밀번호 만료 여부 확인
   */
  isPasswordExpired(): boolean {
    return !this.passwordExpiresAt || this.passwordExpiresAt.getTime() < Date.now();
  }

  /**
   * 계정 잠금 여부 확인 (DB 기반)
   */
  isLocked(): boolean {
    return !!this.lockUntil && this.lockUntil.getTime() > Date.now();
  }

  /**
   * 계정 활성화 여부 확인
   */
  isActive(): boolean {
    return this.status === AccountStatus.ACTIVE;
  }

  /**
   * 휴면 계정 여부 확인 (90일 미접속)
   */
  isDormant(): boolean {
    if (!this.lastLoginAt) return false;
    const dormancyPeriodMs = 90 * 24 * 60 * 60 * 1000;
    return Date.now() - this.lastLoginAt.getTime() > dormancyPeriodMs;
  }
}
