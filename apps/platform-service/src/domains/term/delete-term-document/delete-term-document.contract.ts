import { Command } from '@nestjs/cqrs';

import type { DeleteTermDocumentRequestDto } from './delete-term-document.request.dto';
import type { DeleteTermDocumentResponseDto } from './delete-term-document.response.dto';

export class DeleteTermDocumentContract extends Command<DeleteTermDocumentResponseDto> {
  constructor(public readonly data: DeleteTermDocumentRequestDto) {
    super();
  }
}
