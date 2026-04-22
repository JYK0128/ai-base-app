import { Transactional } from '@mikro-orm/decorators/legacy';
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ManagerAccountRepository } from '@pkg/database';

export class DeferPasswordChangeCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeferPasswordChangeCommand)
export class DeferPasswordChangeHandler implements ICommandHandler<DeferPasswordChangeCommand> {
  private readonly logger = new Logger(DeferPasswordChangeHandler.name);

  constructor(private readonly managerAccountRepository: ManagerAccountRepository) {}

  @Transactional()
  async execute(command: DeferPasswordChangeCommand): Promise<void> {
    const { userId } = command;
    this.logger.log(`Deferring password change for user: ${userId}`);

    const account = await this.managerAccountRepository.findOne(userId);
    if (!account) {
      throw new NotFoundException('계정을 찾을 수 없습니다.');
    }

    if (account.forcePasswordChange) {
      throw new ForbiddenException('관리자에 의해 강제된 비밀번호 변경은 연기할 수 없습니다.');
    }

    // 다음 변경 예정일을 현재 시점으로부터 90일 후로 연장
    account.nextPasswordChangeAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    this.logger.log(`Password change deferred. Next change due at: ${account.nextPasswordChangeAt}`);
  }
}
