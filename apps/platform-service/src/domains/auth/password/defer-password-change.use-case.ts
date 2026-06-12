import { Transactional } from '@mikro-orm/decorators/legacy';
import { CoreRepository, MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { DeferPasswordChangeAsserter } from '../auth.errors';
import type { DeferPasswordChangeInput } from '../auth.types';

/**
 * 관리자 계정 비밀번호 변경 연기 유스케이스
 */
export class DeferPasswordChangeUseCase {
  private readonly Asserter = DeferPasswordChangeAsserter;

  constructor(private readonly memberAccountRepository: CoreRepository<MemberAccount>) {}

  @Transactional()
  async execute({ accountId }: DeferPasswordChangeInput): Promise<void> {
    const account = await this.identifyAccount(accountId);
    await this.validatePolicies(account);

    this.processDeferment(account);
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
   * STEP 2: 정책 검증
   */
  private async validatePolicies(account: MemberAccount) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
  }

  /**
   * STEP 3: 유예 처리
   */
  private processDeferment(account: MemberAccount) {
    account.deferPasswordExpiry(ENV.PASSWORD_EXPIRY_DAYS);
  }
}
