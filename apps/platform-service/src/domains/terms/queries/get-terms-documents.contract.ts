import { Query } from '@nestjs/cqrs';

import type { GetTermsDocumentResponseDto } from './get-terms-document.response.dto';
import type { GetTermsDocumentsRequestDto } from './get-terms-documents.request.dto';

export class GetTermsDocumentsContract extends Query<GetTermsDocumentResponseDto[]> {
  constructor(public readonly data: GetTermsDocumentsRequestDto) {
    super();
  }
}
