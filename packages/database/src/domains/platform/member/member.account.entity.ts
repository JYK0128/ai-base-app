import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import bcrypt from 'bcrypt';

import { CoreEntity } from '../../core/core.entity';
import { MemberAccountRepository } from './member.account.repository';
import { Member } from './member.entity';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ schema: 'platform', repository: () => MemberAccountRepository })
export class MemberAccount extends CoreEntity<MemberAccount> {
  [EntityName]?: 'MemberAccount';

  @Property({ type: 'string', unique: true })
  email!: string;

  @Property({ type: 'string', hidden: true })
  password!: string;

  @Property({ type: Date })
  passwordExpiresAt!: Date;

  @Property({ type: Date, nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'string', nullable: true })
  lastLoginIp?: string;

  @Enum(() => AccountStatus)
  status: Opt<AccountStatus> = AccountStatus.ACTIVE;

  @Property({ type: Date, nullable: true })
  lockUntil?: Date;

  @ManyToOne(() => Member)
  member!: Rel<Member>;

  /**
   * 비밀번호 만료 여부 확인
   */
  get isPasswordExpired(): Opt<boolean> {
    return !this.passwordExpiresAt || this.passwordExpiresAt.getTime() < Date.now();
  }

  /**
   * 계정 잠금 여부 확인 (DB 기반)
   */
  get isLocked(): Opt<boolean> {
    return !!this.lockUntil && this.lockUntil.getTime() > Date.now();
  }

  /**
   * 계정 활성화 여부 확인
   */
  get isActive(): Opt<boolean> {
    return this.status === AccountStatus.ACTIVE;
  }

  /**
   * 휴면 계정 여부 확인 (90일 미접속)
   */
  get isDormant(): Opt<boolean> {
    if (!this.lastLoginAt) return false;
    const dormancyPeriodMs = 90 * 24 * 60 * 60 * 1000;
    return Date.now() - this.lastLoginAt.getTime() > dormancyPeriodMs;
  }

  /**
   * 비밀번호 검증
   */
  verifyPassword(password: string) {
    return bcrypt.compareSync(password, this.password);
  }

  /**
   * 비밀번호 변경 및 만료일 갱신
   */
  updatePassword(password: string, expiryDays: number) {
    const saltRounds = 10;
    this.password = bcrypt.hashSync(password, saltRounds);
    this.passwordExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  }

  /**
   * 비밀번호 변경 연기 및 만료일 갱신
   */
  deferPasswordExpiry(expiryDays: number) {
    this.passwordExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  }
}
