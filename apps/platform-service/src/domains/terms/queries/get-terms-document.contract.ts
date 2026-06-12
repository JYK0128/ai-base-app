import { Query } from '@nestjs/cqrs';

import type { TermsDocumentDetailResponseDto } from './get-terms-document.response.dto';

export class GetTermsDocumentContract extends Query<TermsDocumentDetailResponseDto> {
  constructor(public readonly id: string) {
    super();
  }
}
