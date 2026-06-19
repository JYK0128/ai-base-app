import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ClsService } from 'nestjs-cls';

import { TermsAgreementService } from '../../terms/terms-agreement.service';
import { GetActiveTermsContract } from './get-active-terms.contract';
import { GetPendingTermsAgreementResponseDto } from './get-pending-terms.response.dto';

@QueryHandler(GetActiveTermsContract)
export class GetActiveTermsHandler implements IQueryHandler<GetActiveTermsContract> {
  constructor(
    private readonly termsAgreementService: TermsAgreementService,
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<GetPendingTermsAgreementResponseDto[]> {
    const organizationId = this.cls.get<string>('organizationId');
    const memberId = this.cls.get<string>('memberId');
    if (!organizationId) {
      return [];
    }

    if (!memberId) {
      return [];
    }

    const pendingTerms = await this.termsAgreementService.resolvePendingAgreementTerms({
      memberId,
      organizationId,
    });

    return pendingTerms.map(
      ({ document, currentVersion }) => new GetPendingTermsAgreementResponseDto(document, currentVersion),
    );
  }
}
