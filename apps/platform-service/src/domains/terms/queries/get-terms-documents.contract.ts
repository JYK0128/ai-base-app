import { Query } from '@nestjs/cqrs';

import type { TermsDocumentResponseDto } from './get-active-terms.response.dto';
import type { GetTermsDocumentsRequestDto } from './get-terms-documents.request.dto';

export class GetTermsDocumentsContract extends Query<TermsDocumentResponseDto[]> {
  constructor(public readonly data: GetTermsDocumentsRequestDto) {
    super();
  }
}
