import { Command } from '@nestjs/cqrs';

import type { CreateTermDocumentVersionRequestDto } from './create-term-document-version.request.dto';
import type { CreateTermDocumentVersionResponseDto } from './create-term-document-version.response.dto';

export class CreateTermDocumentVersionContract extends Command<CreateTermDocumentVersionResponseDto> {
  constructor(
    public readonly documentId: string,
    public readonly data: CreateTermDocumentVersionRequestDto,
  ) {
    super();
  }
}
