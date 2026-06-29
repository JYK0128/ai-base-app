import { Query } from '@nestjs/cqrs';

import type { GetTermDocumentRequestDto } from './get-term-document.request.dto';
import type { GetTermDocumentDetailResponseDto } from './get-term-document.response.dto';

export class GetTermDocumentContract extends Query<GetTermDocumentDetailResponseDto> {
  constructor(public readonly data: GetTermDocumentRequestDto) {
    super();
  }
}
