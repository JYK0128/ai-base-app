import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, ManagerAccountRepository } from '@pkg/database';

export { DeferPasswordChangeCommand } from './defer-password-change.helpers';
import { DeferPasswordChangeAsserter, DeferPasswordChangeCommand } from './defer-password-change.helpers';

@CommandHandler(DeferPasswordChangeCommand)
export class DeferPasswordChangeHandler implements ICommandHandler<DeferPasswordChangeCommand> {
  private readonly passwordExpiryDays = 90;
  private readonly DeferPasswordGuard = DeferPasswordChangeAsserter;

  constructor(private readonly managerAccountRepository: ManagerAccountRepository) {}

  @Transactional()
  async execute(command: DeferPasswordChangeCommand): Promise<void> {
    const { id } = command;

    // 1. 계정 존재 여부 및 상태 확인
    const account = await this.DeferPasswordGuard.assert(
      await this.managerAccountRepository.findOne(id),
      'ACCOUNT_NOT_FOUND',
    );

    await this.DeferPasswordGuard.throwIf(account.status === AccountStatus.INACTIVE, 'INACTIVE_ACCOUNT');

    // 2. 정책 관련 날짜 갱신
    account.passwordExpiresAt = new Date(Date.now() + this.passwordExpiryDays * 24 * 60 * 60 * 1000);
  }
}
