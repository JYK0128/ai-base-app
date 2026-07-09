import { Command } from '@nestjs/cqrs';

import type { DeleteTermDocumentVersionResponseDto } from './delete-term-document-version.response.dto';

export class DeleteTermDocumentVersionContract extends Command<DeleteTermDocumentVersionResponseDto> {
  constructor(
    public readonly documentId: string,
    public readonly versionId: string,
  ) {
    super();
  }
}
