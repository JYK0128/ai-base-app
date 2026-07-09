import { Transactional } from '@mikro-orm/decorators/legacy';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { DeleteTermDocumentContract } from './delete-term-document.contract';
import { DeleteTermDocumentResponseDto } from './delete-term-document.response.dto';

@CommandHandler(DeleteTermDocumentContract)
export class DeleteTermDocumentHandler implements ICommandHandler<DeleteTermDocumentContract> {
  constructor() {}

  @Transactional()
  async execute(command: DeleteTermDocumentContract): Promise<DeleteTermDocumentResponseDto> {
    const document = await this.identifyDocument(command.data.id);
    await this.verifyDeletion(document.id);
    await this.processDelete(document.id);

    return new DeleteTermDocumentResponseDto(document.id);
  }

  private async identifyDocument(documentId: string): Promise<TermsDocument> {
    const document = await TermsDocument.findOne({ id: documentId });

    if (!document) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND');
    }

    return document;
  }

  private async verifyDeletion(documentId: string): Promise<void> {
    const versionCount = await TermsVersion.count({ termsDocument: documentId });

    if (versionCount > 0) {
      throw new ConflictException('DOCUMENT_HAS_VERSIONS');
    }
  }

  private async processDelete(documentId: string): Promise<void> {
    await TermsDocument.nativeDelete({ id: documentId });
  }
}
