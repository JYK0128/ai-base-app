import { Transactional } from '@mikro-orm/decorators/legacy';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion, TermsVersionStatus } from '@pkg/database';

import { DeleteTermDocumentVersionContract } from './delete-term-document-version.contract';
import { DeleteTermDocumentVersionResponseDto } from './delete-term-document-version.response.dto';

@CommandHandler(DeleteTermDocumentVersionContract)
export class DeleteTermDocumentVersionHandler implements ICommandHandler<DeleteTermDocumentVersionContract> {
  constructor() {}

  @Transactional()
  async execute(command: DeleteTermDocumentVersionContract): Promise<DeleteTermDocumentVersionResponseDto> {
    const document = await this.identifyDocument(command.documentId);
    const version = await this.identifyVersion(command);
    this.verifyDelete(document, version);
    await this.processDelete(command, document, version);

    return new DeleteTermDocumentVersionResponseDto(version.id);
  }

  private async identifyDocument(documentId: string): Promise<TermsDocument> {
    const document = await TermsDocument.findOne({ id: documentId });

    if (!document) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND');
    }

    return document;
  }

  private async identifyVersion(command: DeleteTermDocumentVersionContract): Promise<TermsVersion> {
    const version = await TermsVersion.findOne({
      id: command.versionId,
      termsDocument: command.documentId,
    });

    if (!version) {
      throw new NotFoundException('VERSION_NOT_FOUND');
    }

    return version;
  }

  private verifyDelete(document: TermsDocument, version: TermsVersion): void {
    if (document.isTerminated) {
      throw new ConflictException({
        code: 'TERMINATED_DOCUMENT_CANNOT_DELETE_VERSION',
        message: '종료된 문서는 버전을 삭제할 수 없습니다.',
      });
    }

    if (!version.isDraft && !version.isScheduledForActivation) {
      throw new ConflictException({
        code: 'ONLY_DRAFT_OR_SCHEDULED_VERSION_CAN_DELETE',
        message: '임시저장 또는 예약 발효 중인 버전만 삭제할 수 있습니다.',
      });
    }
  }

  private async processDelete(
    command: DeleteTermDocumentVersionContract,
    document: TermsDocument,
    version: TermsVersion,
  ): Promise<void> {
    await TermsVersion.nativeDelete({
      id: version.id,
      termsDocument: command.documentId,
    });

    const remainingPublishedVersionCount = await TermsVersion.count({
      termsDocument: command.documentId,
      status: TermsVersionStatus.PUBLISHED,
    });

    if (remainingPublishedVersionCount === 0) {
      await TermsDocument.nativeUpdate(
        { id: document.id },
        {
          metadata: {
            ...(document.metadata ?? {}),
            publishedAt: null,
            terminatedAt: null,
          },
        },
      );
    }
  }
}
