import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { DeferPasswordChangeCommand } from './defer-password-change.command';
import { DeferPasswordChangeAsserter } from './defer-password-change.error';

/**
 * 관리자 계정 비밀번호 변경 연기 핸들러
 */
@CommandHandler(DeferPasswordChangeCommand)
export class DeferPasswordChangeHandler implements ICommandHandler<DeferPasswordChangeCommand> {
  private readonly Asserter = DeferPasswordChangeAsserter;

  constructor(private readonly memberAccountRepository: CoreRepository<MemberAccount>) {}

  @Transactional()
  async execute(command: DeferPasswordChangeCommand): Promise<void> {
    const { accountId } = command;

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
