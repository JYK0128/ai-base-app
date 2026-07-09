import { Command } from '@nestjs/cqrs';

import type { UpdateTermDocumentVersionRequestDto } from './update-term-document-version.request.dto';
import type { UpdateTermDocumentVersionResponseDto } from './update-term-document-version.response.dto';

export class UpdateTermDocumentVersionContract extends Command<UpdateTermDocumentVersionResponseDto> {
  constructor(
    public readonly documentId: string,
    public readonly versionId: string,
    public readonly data: UpdateTermDocumentVersionRequestDto,
  ) {
    super();
  }
}
