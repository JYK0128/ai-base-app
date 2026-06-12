import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { ChangePasswordContract } from './change-password.contract';
import { ChangePasswordAsserter } from './change-password.error';
import { ChangePasswordResponseDto } from './change-password.response.dto';

@CommandHandler(ChangePasswordContract)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordContract> {
  private readonly Asserter = ChangePasswordAsserter;

  constructor(
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
  ) {}

  @Transactional()
  async execute(command: ChangePasswordContract): Promise<ChangePasswordResponseDto> {
    const { accountId, currentPassword, newPassword } = command.data;

    const account = await this.identifyAccount(accountId);
    await this.validatePolicies(account, currentPassword);

    this.processPasswordUpdate(account, newPassword);

    return new ChangePasswordResponseDto();
  }

  private async identifyAccount(accountId: string): Promise<MemberAccount> {
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
