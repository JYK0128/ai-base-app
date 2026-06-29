import { Query } from '@nestjs/cqrs';

import type { GetTermDocumentListRequestDto } from './get-term-document-list.request.dto';
import type { GetTermDocumentListResponseDto } from './get-term-document-list.response.dto';

export class GetTermDocumentListContract extends Query<GetTermDocumentListResponseDto> {
  constructor(public readonly data: GetTermDocumentListRequestDto) {
    super();
  }
}
