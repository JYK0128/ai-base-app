import { Command } from '@nestjs/cqrs';

import type { CancelTermDocumentTerminationResponseDto } from './cancel-term-document-termination.response.dto';

export class CancelTermDocumentTerminationContract extends Command<CancelTermDocumentTerminationResponseDto> {
  constructor(public readonly documentId: string) {
    super();
  }
}
