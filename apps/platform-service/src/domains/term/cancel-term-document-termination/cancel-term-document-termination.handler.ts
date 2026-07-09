import { Transactional } from '@mikro-orm/decorators/legacy';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument } from '@pkg/database';

import { CancelTermDocumentTerminationContract } from './cancel-term-document-termination.contract';
import { CancelTermDocumentTerminationResponseDto } from './cancel-term-document-termination.response.dto';

@CommandHandler(CancelTermDocumentTerminationContract)
export class CancelTermDocumentTerminationHandler implements ICommandHandler<CancelTermDocumentTerminationContract> {
  constructor() {}

  @Transactional()
  async execute(command: CancelTermDocumentTerminationContract): Promise<CancelTermDocumentTerminationResponseDto> {
    const document = await this.identifyDocument(command.documentId);
    this.verifyCancel(document);
    await this.processCancel(command, document);

    return new CancelTermDocumentTerminationResponseDto(document.id);
  }

  private async identifyDocument(documentId: string): Promise<TermsDocument> {
    const document = await TermsDocument.findOne({ id: documentId });

    if (!document) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND');
    }

    return document;
  }

  private verifyCancel(document: TermsDocument): void {
    const terminatedAt = document.metadata?.terminatedAt
      ? new Date(document.metadata.terminatedAt)
      : null;

    if (terminatedAt && terminatedAt <= new Date()) {
      throw new ConflictException('TERMINATION_ALREADY_EFFECTIVE');
    }
  }

  private async processCancel(
    _command: CancelTermDocumentTerminationContract,
    document: TermsDocument,
  ): Promise<void> {
    await TermsDocument.nativeUpdate(
      { id: document.id },
      {
        metadata: {
          ...(document.metadata ?? {}),
          terminatedAt: null,
        },
      },
    );
  }
}
