import { Command } from '@nestjs/cqrs';

import type { CreateTermDocumentRequestDto } from './create-term-document.request.dto';
import type { CreateTermDocumentResponseDto } from './create-term-document.response.dto';

export class CreateTermDocumentContract extends Command<CreateTermDocumentResponseDto> {
  constructor(public readonly data: CreateTermDocumentRequestDto) {
    super();
  }
}
