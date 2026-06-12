import { Transactional } from '@mikro-orm/decorators/legacy';
import { CoreRepository, MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { ChangePasswordAsserter } from '../auth.errors';
import type { ChangePasswordInput } from '../auth.types';

/**
 * 관리자 계정 비밀번호 변경 유스케이스
 */
export class ChangePasswordUseCase {
  private readonly Asserter = ChangePasswordAsserter;

  constructor(
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
  ) {}

  @Transactional()
  async execute({ accountId, currentPassword, newPassword }: ChangePasswordInput): Promise<void> {
    const account = await this.identifyAccount(accountId);
    await this.validatePolicies(account, currentPassword);

    this.processPasswordUpdate(account, newPassword);
  }

  /**
   * STEP 1: 계정 식별
   */
  private async identifyAccount(accountId: string): Promise<MemberAccount> {
    return await this.Asserter.assert(
      this.memberAccountRepository.findOne(accountId),
      'ACCOUNT_NOT_FOUND',
    );
  }

  /**
   * STEP 2: 정책 및 비밀번호 검증
   */
  private async validatePolicies(account: MemberAccount, currentPassword: string) {
    // 2-1. 계정 활성화 여부 확인
    await this.Asserter.throwIf(
      !account.isActive,
      'INACTIVE_ACCOUNT',
    );

    // 2-2. 계정 잠금 여부 확인
    await this.Asserter.throwIf(
      account.isLocked,
      'ACCOUNT_LOCKED',
    );

    // 2-3. 현재 비밀번호 검증
    await this.Asserter.throwIf(
      !account.verifyPassword(currentPassword),
      'INVALID_CURRENT_PASSWORD',
    );
  }

  /**
   * STEP 3: 비밀번호 업데이트
   */
  private processPasswordUpdate(account: MemberAccount, newPassword: string) {
    account.updatePassword(newPassword, ENV.PASSWORD_EXPIRY_DAYS);
  }
}
