import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { ENV } from '@/env';

import { AuthChangePasswordContract } from './change-password.contract';
import { ChangePasswordAsserter } from './change-password.error';
import { AuthChangePasswordResponseDto } from './change-password.response.dto';

@CommandHandler(AuthChangePasswordContract)
export class ChangePasswordHandler implements ICommandHandler<AuthChangePasswordContract> {
  private readonly Asserter = ChangePasswordAsserter;

  constructor(
    private readonly cls: ClsService,
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
  ) {}

  @Transactional()
  async execute(command: AuthChangePasswordContract): Promise<AuthChangePasswordResponseDto> {
    const { currentPassword, newPassword } = command.data;

    const account = await this.identifyAccount();
    await this.validatePolicies(account, currentPassword);

    this.processPasswordUpdate(account, newPassword);

    return new AuthChangePasswordResponseDto();
  }

  private async identifyAccount(): Promise<MemberAccount> {
    const accountId = this.cls.get<string>('accountId');
    if (!accountId) {
      throw new UnauthorizedException('인증 정보가 유효하지 않습니다.');
    }

    return await this.Asserter.assert(
      this.memberAccountRepository.findOne(accountId),
      'ACCOUNT_NOT_FOUND',
    );
  }

  private async validatePolicies(account: MemberAccount, currentPassword: string) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
    await this.Asserter.throwIf(account.isLocked, 'ACCOUNT_LOCKED');
    await this.Asserter.throwIf(!account.verifyPassword(currentPassword), 'INVALID_CURRENT_PASSWORD');
  }

  private processPasswordUpdate(account: MemberAccount, newPassword: string) {
    account.updatePassword(newPassword, ENV.PASSWORD_EXPIRY_DAYS);
  }
}
