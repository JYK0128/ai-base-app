import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';

import { ENV } from '@/env';

import { DeferPasswordChangeCommand } from './defer-password-change.command';
import { DeferPasswordChangeAsserter } from './defer-password-change.error';
import { DeferPasswordChangeResponseDto } from './defer-password-change.response.dto';

@CommandHandler(DeferPasswordChangeCommand)
export class DeferPasswordChangeHandler implements ICommandHandler<DeferPasswordChangeCommand> {
  private readonly Asserter = DeferPasswordChangeAsserter;

  constructor(private readonly memberAccountRepository: CoreRepository<MemberAccount>) {}

  @Transactional()
  async execute(command: DeferPasswordChangeCommand): Promise<DeferPasswordChangeResponseDto> {
    const { accountId } = command.data;

    const account = await this.identifyAccount(accountId);
    await this.validatePolicies(account);

    this.processDeferment(account);

    return new DeferPasswordChangeResponseDto();
  }

  private async identifyAccount(accountId: string): Promise<MemberAccount> {
    return await this.Asserter.assert(
      this.memberAccountRepository.findOne(accountId),
      'ACCOUNT_NOT_FOUND',
    );
  }

  private async validatePolicies(account: MemberAccount) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
  }

  private processDeferment(account: MemberAccount) {
    account.deferPasswordExpiry(ENV.PASSWORD_EXPIRY_DAYS);
  }
}
