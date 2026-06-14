import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, MemberAccount } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { ENV } from '@/env';

import { AuthDeferPasswordChangeContract } from './defer-password-change.contract';
import { DeferPasswordChangeAsserter } from './defer-password-change.error';
import { AuthDeferPasswordChangeResponseDto } from './defer-password-change.response.dto';

@CommandHandler(AuthDeferPasswordChangeContract)
export class DeferPasswordChangeHandler implements ICommandHandler<AuthDeferPasswordChangeContract> {
  private readonly Asserter = DeferPasswordChangeAsserter;

  constructor(
    private readonly cls: ClsService,
    @InjectRepository(MemberAccount)
    private readonly memberAccountRepository: CoreRepository<MemberAccount>,
  ) {}

  @Transactional()
  async execute(_command: AuthDeferPasswordChangeContract): Promise<AuthDeferPasswordChangeResponseDto> {
    const account = await this.identifyAccount();
    await this.validatePolicies(account);

    this.processDeferment(account);

    return new AuthDeferPasswordChangeResponseDto();
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

  private async validatePolicies(account: MemberAccount) {
    await this.Asserter.throwIf(!account.isActive, 'INACTIVE_ACCOUNT');
  }

  private processDeferment(account: MemberAccount) {
    account.deferPasswordExpiry(ENV.PASSWORD_EXPIRY_DAYS);
  }
}
