import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ManagerAccount, ManagerAccountRepository } from '@pkg/database';

import { ENV } from '@/common/env';

import { ChangePasswordAsserter, ChangePasswordCommand } from './change-password.helpers';

/**
 * 관리자 계정 비밀번호 변경 핸들러
 */
@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  private readonly Asserter = ChangePasswordAsserter;

  constructor(
    private readonly managerAccountRepository: ManagerAccountRepository,
  ) {}

  @Transactional()
  async execute(command: ChangePasswordCommand): Promise<void> {
    const { id, currentPassword, newPassword } = command;

    const account = await this.identifyAccount(id);
    await this.validatePolicies(account, currentPassword);

    this.processPasswordUpdate(account, newPassword);
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
   * STEP 2: 정책 및 비밀번호 검증
   */
  private async validatePolicies(account: ManagerAccount, currentPassword: string) {
    // 2-1. 계정 활성화 여부 확인
    await this.Asserter.throwIf(
      !account.isActive(),
      'INACTIVE_ACCOUNT',
    );

    // 2-2. 계정 잠금 여부 확인
    await this.Asserter.throwIf(
      account.isLocked(),
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
  private processPasswordUpdate(account: ManagerAccount, newPassword: string) {
    account.updatePassword(newPassword, ENV.PASSWORD_EXPIRY_DAYS);
  }
}
