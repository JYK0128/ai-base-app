import { Query } from '@nestjs/cqrs';

import type { GetTermsDocumentResponseDto } from '../get-terms-document/get-terms-document.response.dto';
import type { GetTermsDocumentPageRequestDto } from './get-terms-document-page.request.dto';

export class GetTermsDocumentPageContract extends Query<GetTermsDocumentResponseDto[]> {
  constructor(public readonly data: GetTermsDocumentPageRequestDto) {
    super();
  }
}
