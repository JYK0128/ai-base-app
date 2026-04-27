import { Transactional } from '@mikro-orm/decorators/legacy';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountStatus, ManagerAccountRepository } from '@pkg/database';

import { CryptoUtil } from '@/common/utils/crypto.util';

export class ChangePasswordCommand {
  constructor(
    public readonly id: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  private readonly passwordExpiryDays = 90;

  constructor(private readonly managerAccountRepository: ManagerAccountRepository) {}

  @Transactional()
  async execute(command: ChangePasswordCommand): Promise<void> {
    const { id, currentPassword, newPassword } = command;

    const account = await this.managerAccountRepository.findOne(id);
    if (!account) {
      throw new NotFoundException('계정을 찾을 수 없습니다.');
    }

    if (account.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }

    if (account.lockUntil && account.lockUntil > new Date()) {
      throw new UnauthorizedException('로그인 시도가 너무 많아 계정이 잠겼습니다. 잠시 후 다시 시도하세요.');
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
    // 다음 변경일은 오늘로부터 passwordExpiryDays일 후
    account.nextPasswordChangeAt = new Date(now.getTime() + this.passwordExpiryDays * 24 * 60 * 60 * 1000);
    account.forcePasswordChange = false;
  }
}
