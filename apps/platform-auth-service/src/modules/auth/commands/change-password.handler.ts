import { Transactional } from '@mikro-orm/decorators/legacy';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ManagerAccount, ManagerAccountRepository } from '@pkg/database';

import { CryptoUtil } from '@/common/utils/crypto.util';

export class ChangePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  private readonly logger = new Logger(ChangePasswordHandler.name);

  constructor(private readonly managerAccountRepository: ManagerAccountRepository) {}

  @Transactional()
  async execute(command: ChangePasswordCommand): Promise<void> {
    const { userId, currentPassword, newPassword } = command;
    this.logger.log(`Changing password for user: ${userId}`);

    const account = await this.managerAccountRepository.findOne(userId);
    if (!account) {
      throw new NotFoundException('계정을 찾을 수 없습니다.');
    }

    // 1. 현재 비밀번호 확인
    const isMatch = await CryptoUtil.comparePassword(currentPassword, account.password);
    if (!isMatch) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 2. 새 비밀번호 해싱 및 저장
    account.password = await CryptoUtil.hashPassword(newPassword);
    
    // 3. 정책 관련 날짜 갱신
    const now = new Date();
    account.passwordChangedAt = now;
    // 다음 변경일은 오늘로부터 90일 후
    account.nextPasswordChangeAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    account.forcePasswordChange = false;

    this.logger.log(`Password changed successfully. Next change due at: ${account.nextPasswordChangeAt}`);
  }
}
