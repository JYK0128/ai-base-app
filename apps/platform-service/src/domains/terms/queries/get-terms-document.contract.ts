import { Query } from '@nestjs/cqrs';

import type { GetTermsDocumentRequestDto } from './get-terms-document.request.dto';
import type { GetTermsDocumentDetailResponseDto } from './get-terms-document.response.dto';

export class GetTermsDocumentContract extends Query<GetTermsDocumentDetailResponseDto> {
  constructor(public readonly data: GetTermsDocumentRequestDto) {
    super();
  }
}
