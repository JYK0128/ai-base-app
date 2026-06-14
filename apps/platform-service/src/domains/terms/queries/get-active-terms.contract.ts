import { Query } from '@nestjs/cqrs';

import type { GetTermsDocumentResponseDto } from './get-active-terms.response.dto';

export class GetActiveTermsContract extends Query<GetTermsDocumentResponseDto[]> {
  constructor() {
    super();
  }
}
