import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TermsConsent } from '@pkg/database';
import type { AuthMemberContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { CreateTermsAgreementContract } from './agree-terms.contract';
import { CreateTermsAgreementResponseDto } from './agree-terms.response.dto';

@CommandHandler(CreateTermsAgreementContract)
export class CreateTermsAgreementHandler implements ICommandHandler<CreateTermsAgreementContract> {
  constructor(
    private readonly cls: ClsService,
  ) {}

  @Transactional()
  async execute(command: CreateTermsAgreementContract): Promise<CreateTermsAgreementResponseDto> {
    const member = this.identifyMember();
    this.verifyTermsAgreement(command, member);
    return this.processAgreement(command, member);
  }

  private identifyMember(): AuthMemberContext {
    return this.cls.get<AuthMemberContext>('member');
  }

  private verifyTermsAgreement(_command: CreateTermsAgreementContract, _member: AuthMemberContext): void {
    // 약관 동의 정책 검증 영역
  }

  private processAgreement(
    command: CreateTermsAgreementContract,
    member: AuthMemberContext,
  ): CreateTermsAgreementResponseDto {
    const consents = TermsConsent.createMany(command.data.terms.map((term) => ({
      member: member.id,
      termsVersion: term.termsVersionId,
      agreed: term.agreed,
    })));

    return new CreateTermsAgreementResponseDto(consents);
  }
}
