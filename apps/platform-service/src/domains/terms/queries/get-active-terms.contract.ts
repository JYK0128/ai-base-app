import { Query } from '@nestjs/cqrs';

import type { TermsDocumentResponseDto } from './get-active-terms.response.dto';

export class GetActiveTermsContract extends Query<TermsDocumentResponseDto[]> {
  constructor() {
    super();
  }
}
