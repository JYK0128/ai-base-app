import { Query } from '@nestjs/cqrs';

import type { GetTermDocumentVersionListRequestDto } from './get-term-document-version-list.request.dto';
import type { GetTermDocumentVersionListResponseDto } from './get-term-document-version-list.response.dto';

export class GetTermDocumentVersionListContract extends Query<GetTermDocumentVersionListResponseDto> {
  constructor(
    public readonly documentId: string,
    public readonly data: GetTermDocumentVersionListRequestDto,
  ) {
    super();
  }
}
