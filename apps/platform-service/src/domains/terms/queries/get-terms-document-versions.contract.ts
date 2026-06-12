import { Query } from '@nestjs/cqrs';

import type { TermsVersionResponseDto } from './get-terms-document.response.dto';

export class GetTermsDocumentVersionsContract extends Query<TermsVersionResponseDto[]> {
  constructor(public readonly data: { id: string, keyword?: string }) {
    super();
  }
}
