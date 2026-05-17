import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ManagerAccount, ManagerAccountRepository } from '@pkg/database';

import { ENV } from '@/common/env';

import { DeferPasswordChangeAsserter,
         DeferPasswordChangeCommand } from './defer-password-change.helpers';

/**
 * 관리자 계정 비밀번호 변경 연기 핸들러
 */
@CommandHandler(DeferPasswordChangeCommand)
export class DeferPasswordChangeHandler implements ICommandHandler<DeferPasswordChangeCommand> {
  private readonly Asserter = DeferPasswordChangeAsserter;

  constructor(private readonly managerAccountRepository: ManagerAccountRepository) {}

  @Transactional()
  async execute(command: DeferPasswordChangeCommand): Promise<void> {
    const { id } = command;

    const account = await this.identifyAccount(id);
    await this.validatePolicies(account);

    this.processDeferment(account);
  }

  /**
   * STEP 1: 계정 식별
   */
  private async identifyAccount(id: string): Promise<ManagerAccount> {
    return await this.Asserter.assert(
      this.managerAccountRepository.findOne(id),
      'ACCOUNT_NOT_FOUND',
    );
  }

  /**
   * STEP 2: 정책 검증
   */
  private async validatePolicies(account: ManagerAccount) {
    await this.Asserter.throwIf(!account.isActive(), 'INACTIVE_ACCOUNT');
  }

  /**
   * STEP 3: 유예 처리
   */
  private processDeferment(account: ManagerAccount) {
    account.deferPasswordExpiry(ENV.PASSWORD_EXPIRY_DAYS);
  }
}
