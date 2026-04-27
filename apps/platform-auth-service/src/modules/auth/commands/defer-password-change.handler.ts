import { Transactional } from '@mikro-orm/decorators/legacy';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, ManagerAccountRepository } from '@pkg/database';

export class DeferPasswordChangeCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeferPasswordChangeCommand)
export class DeferPasswordChangeHandler implements ICommandHandler<DeferPasswordChangeCommand> {
  private readonly passwordExpiryDays = 90;

  constructor(private readonly managerAccountRepository: ManagerAccountRepository) {}

  @Transactional()
  async execute(command: DeferPasswordChangeCommand): Promise<void> {
    const { id } = command;

    const account = await this.managerAccountRepository.findOne(id);
    if (!account) {
      throw new NotFoundException('계정을 찾을 수 없습니다.');
    }

    if (account.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }

    if (account.forcePasswordChange) {
      throw new ForbiddenException('관리자에 의해 강제된 비밀번호 변경은 연기할 수 없습니다.');
    }

    // 다음 변경 예정일을 현재 시점으로부터 passwordExpiryDays일 후로 연장
    account.nextPasswordChangeAt = new Date(Date.now() + this.passwordExpiryDays * 24 * 60 * 60 * 1000);
  }
}
