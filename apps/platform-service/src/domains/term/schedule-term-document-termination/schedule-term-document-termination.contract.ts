import { Command } from '@nestjs/cqrs';

import type { ScheduleTermDocumentTerminationRequestDto } from './schedule-term-document-termination.request.dto';
import type { ScheduleTermDocumentTerminationResponseDto } from './schedule-term-document-termination.response.dto';

export class ScheduleTermDocumentTerminationContract extends Command<ScheduleTermDocumentTerminationResponseDto> {
  constructor(
    public readonly documentId: string,
    public readonly data: ScheduleTermDocumentTerminationRequestDto,
  ) {
    super();
  }
}
