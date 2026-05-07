import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, ManagerAccountRepository } from '@pkg/database';

import { CryptoUtil } from '@/common/utils/crypto.util';

export { ChangePasswordCommand } from './change-password.handler.helpers';
import { ChangePasswordAsserter, ChangePasswordCommand } from './change-password.handler.helpers';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  private readonly passwordExpiryDays = 90;
  private readonly ChangePasswordGuard = ChangePasswordAsserter;

  constructor(private readonly managerAccountRepository: ManagerAccountRepository) {}

  @Transactional()
  async execute(command: ChangePasswordCommand): Promise<void> {
    const { id, currentPassword, newPassword } = command;

    // 1. 계정 존재 여부 및 상태 확인
    const account = await this.ChangePasswordGuard.assert(
      await this.managerAccountRepository.findOne(id),
      'ACCOUNT_NOT_FOUND',
    );

    await this.ChangePasswordGuard.throwIf(account.status === AccountStatus.INACTIVE, 'INACTIVE_ACCOUNT');
    await this.ChangePasswordGuard.throwIf(
      !!(account.lockUntil && account.lockUntil > new Date()),
      'ACCOUNT_LOCKED',
    );

    // 2. 현재 비밀번호 확인
    const isMatch = await CryptoUtil.comparePassword(currentPassword, account.password);
    await this.ChangePasswordGuard.assert(isMatch, 'INVALID_CURRENT_PASSWORD');

    // 3. 새 비밀번호 해싱 및 저장
    account.password = await CryptoUtil.hashPassword(newPassword);

    // 4. 정책 관련 날짜 갱신
    const now = new Date();
    account.passwordExpiresAt = new Date(now.getTime() + this.passwordExpiryDays * 24 * 60 * 60 * 1000);
  }
}
