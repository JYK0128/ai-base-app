import { Transactional } from '@mikro-orm/decorators/legacy';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument } from '@pkg/database';

import { ScheduleTermDocumentTerminationContract } from './schedule-term-document-termination.contract';
import { ScheduleTermDocumentTerminationResponseDto } from './schedule-term-document-termination.response.dto';

@CommandHandler(ScheduleTermDocumentTerminationContract)
export class ScheduleTermDocumentTerminationHandler implements ICommandHandler<ScheduleTermDocumentTerminationContract> {
  constructor() {}

  @Transactional()
  async execute(command: ScheduleTermDocumentTerminationContract): Promise<ScheduleTermDocumentTerminationResponseDto> {
    const document = await this.identifyDocument(command.documentId);
    await this.processSchedule(command, document);

    return new ScheduleTermDocumentTerminationResponseDto(document.id);
  }

  private async identifyDocument(documentId: string): Promise<TermsDocument> {
    const document = await TermsDocument.findOne({ id: documentId });

    if (!document) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND');
    }

    return document;
  }

  private async processSchedule(
    command: ScheduleTermDocumentTerminationContract,
    document: TermsDocument,
  ): Promise<void> {
    await TermsDocument.nativeUpdate(
      { id: document.id },
      {
        metadata: {
          ...(document.metadata ?? {}),
          terminatedAt: command.data.terminatedAt,
        },
      },
    );
  }
}
