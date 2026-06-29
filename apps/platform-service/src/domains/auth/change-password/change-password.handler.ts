import { Transactional } from '@mikro-orm/decorators/legacy';
import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount } from '@pkg/database';
import type { AuthAccountContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { ENV } from '@/env';

import { ChangePasswordContract } from './change-password.contract';
import { ChangePasswordAsserter } from './change-password.error';
import { ChangePasswordResponseDto } from './change-password.response.dto';

@CommandHandler(ChangePasswordContract)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordContract> {
  private readonly Asserter = ChangePasswordAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: ChangePasswordContract): Promise<ChangePasswordResponseDto> {
    const { currentPassword } = command.data;

    const account = await this.identifyAccount();
    await this.verifyPolicies(account, currentPassword);

    this.processChangePassword(command, account);

    return new ChangePasswordResponseDto();
  }

  private async identifyAccount(): Promise<MemberAccount> {
    const account = this.cls.get<AuthAccountContext>('account');
    if (!account) {
      throw new UnauthorizedException('인증 정보가 유효하지 않습니다.');
    }

    return await this.Asserter.assert(
      MemberAccount.findOne(account.id),
      'ACCOUNT_NOT_FOUND',
    );
  }

  private async verifyPolicies(account: MemberAccount, currentPassword: string) {
    await this.Asserter.throwIf(!account.verifyPassword(currentPassword), 'INVALID_CURRENT_PASSWORD');
  }

  private processChangePassword(command: ChangePasswordContract, account: MemberAccount) {
    const { newPassword } = command.data;
    account.updatePassword(newPassword, ENV.PASSWORD_EXPIRY_DAYS);
  }
}
