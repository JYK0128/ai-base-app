import { Query } from '@nestjs/cqrs';

import type { GetTermsDocumentVersionResponseDto } from '../get-terms-document/get-terms-document.response.dto';
import type { GetTermsDocumentVersionsRequestDto } from './get-terms-document-versions.request.dto';

export class GetTermsDocumentVersionsContract extends Query<GetTermsDocumentVersionResponseDto[]> {
  constructor(
    public readonly documentId: string,
    public readonly data: GetTermsDocumentVersionsRequestDto,
  ) {
    super();
  }
}
