import { Transactional } from '@mikro-orm/decorators/legacy';
import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { MemberAccount } from '@pkg/database';
import type { AuthAccountContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { ENV } from '@/env';

import { DeferPasswordChangeContract } from './defer-password-change.contract';
import { DeferPasswordChangeAsserter } from './defer-password-change.error';
import { DeferPasswordChangeResponseDto } from './defer-password-change.response.dto';

@CommandHandler(DeferPasswordChangeContract)
export class DeferPasswordChangeHandler implements ICommandHandler<DeferPasswordChangeContract> {
  private readonly Asserter = DeferPasswordChangeAsserter;

  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(_command: DeferPasswordChangeContract): Promise<DeferPasswordChangeResponseDto> {
    const account = await this.identifyAccount();
    this.verifyDeferment(account);
    return this.processUpdate(account);
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

  private verifyDeferment(_account: MemberAccount): void {
    // 비밀번호 변경 연기 정책 검증 영역
  }

  private processUpdate(account: MemberAccount): DeferPasswordChangeResponseDto {
    account.deferPasswordExpiry(ENV.PASSWORD_EXPIRY_DAYS);

    return new DeferPasswordChangeResponseDto();
  }
}
