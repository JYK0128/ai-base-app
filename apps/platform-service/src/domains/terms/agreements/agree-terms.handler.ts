import { Transactional } from '@mikro-orm/decorators/legacy';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { ClsService } from 'nestjs-cls';

import type { MemberTermsConsentResponseDto } from '../queries/get-terms-document.response.dto';
import { TermsAgreementService } from '../terms-agreement.service';
import { AgreeTermsContract } from './agree-terms.contract';
import { AgreeTermsAsserter } from './agree-terms.error';

@CommandHandler(AgreeTermsContract)
export class AgreeTermsHandler implements ICommandHandler<AgreeTermsContract> {
  private readonly Asserter = AgreeTermsAsserter;

  constructor(
    private readonly cls: ClsService,
    private readonly termsAgreementService: TermsAgreementService,
  ) {}

  @Transactional()
  async execute({ data }: AgreeTermsContract): Promise<MemberTermsConsentResponseDto> {
    const memberId = this.cls.get<string>('memberId');
    const organizationId = this.cls.get<string>('organizationId');

    await this.Asserter.throwIf(!memberId, 'REQUEST_CONTEXT_NOT_FOUND');
    await this.Asserter.throwIf(memberId !== data.memberId, 'MEMBER_MISMATCH');

    return this.termsAgreementService.agree(memberId, organizationId, data.termsVersionId);
  }
}
