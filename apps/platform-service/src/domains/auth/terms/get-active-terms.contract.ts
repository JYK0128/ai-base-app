import { Query } from '@nestjs/cqrs';

import type { GetPendingTermsAgreementResponseDto } from './get-pending-terms.response.dto';

export class GetActiveTermsContract extends Query<GetPendingTermsAgreementResponseDto[]> {
  constructor() {
    super();
  }
}
