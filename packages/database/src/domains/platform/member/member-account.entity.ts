import { EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/decorators/legacy';
import bcrypt from 'bcrypt';

import { CoreEntity } from '../../core/core.entity';
import { AccountStatus } from './member.constants';
import { Member } from './member.entity';
import { isMemberAccountActive,
         isMemberAccountDormant,
         isMemberAccountPasswordExpired } from './member-account.policy-status';

@Entity({ schema: 'platform' })
export class MemberAccount extends CoreEntity<MemberAccount> {
  [EntityName]?: 'MemberAccount';

  @ManyToOne(() => Member)
  member!: Rel<Member>;

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

  /**
   * 비밀번호 만료 여부 확인
   */
  @Property({ persist: false })
  get isPasswordExpired(): Opt<boolean> {
    return isMemberAccountPasswordExpired(this.passwordExpiresAt);
  }

  /**
   * 계정 활성화 여부 확인
   */
  @Property({ persist: false })
  get isActive(): Opt<boolean> {
    return isMemberAccountActive(this.status);
  }

  /**
   * 휴면 계정 여부 확인 (90일 미접속)
   */
  @Property({ persist: false })
  get isDormant(): Opt<boolean> {
    return isMemberAccountDormant(this.lastLoginAt);
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
