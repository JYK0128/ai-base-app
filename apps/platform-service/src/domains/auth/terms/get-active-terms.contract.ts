import { Query } from '@nestjs/cqrs';

import type { GetTermsDocumentResponseDto } from '../../terms/get-terms-document/get-terms-document.response.dto';

export class GetActiveTermsContract extends Query<GetTermsDocumentResponseDto[]> {
  constructor() {
    super();
  }
}
