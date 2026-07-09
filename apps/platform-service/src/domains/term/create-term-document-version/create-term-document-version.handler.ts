import { createHash } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion, TermsVersionStatus } from '@pkg/database';

import { CreateTermDocumentVersionContract } from './create-term-document-version.contract';
import { CreateTermDocumentVersionResponseDto } from './create-term-document-version.response.dto';

type TermsVersionMetadata = {
  reason?: string
  summary?: string
};

@CommandHandler(CreateTermDocumentVersionContract)
export class CreateTermDocumentVersionHandler implements ICommandHandler<CreateTermDocumentVersionContract> {
  constructor() {}

  @Transactional()
  async execute(command: CreateTermDocumentVersionContract): Promise<CreateTermDocumentVersionResponseDto> {
    const document = await this.identifyDocument(command.documentId);
    this.verifyCreation(document);

    const version = this.processCreation(command, document);

    return new CreateTermDocumentVersionResponseDto(version.id);
  }

  private async identifyDocument(documentId: string): Promise<TermsDocument> {
    const document = await TermsDocument.findOne({ id: documentId });

    if (!document) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND');
    }

    return document;
  }

  private verifyCreation(document: TermsDocument): void {
    if (document.isTerminated) {
      throw new ConflictException({
        code: 'TERMINATED_DOCUMENT_CANNOT_CREATE_VERSION',
        message: '종료된 문서는 버전을 추가할 수 없습니다.',
      });
    }
  }

  private processCreation(
    command: CreateTermDocumentVersionContract,
    document: TermsDocument,
  ): TermsVersion {
    const checksum = createHash('sha256').update(command.data.content.trim()).digest('hex');
    const metadata: TermsVersionMetadata = {};

    if (command.data.summary?.trim()) {
      metadata.summary = command.data.summary.trim();
    }

    if (command.data.reason?.trim()) {
      metadata.reason = command.data.reason.trim();
    }

    if (command.data.status === TermsVersionStatus.PUBLISHED) {
      document.metadata = {
        ...(document.metadata ?? {}),
        publishedAt: document.metadata?.publishedAt ?? new Date(),
        terminatedAt: document.metadata?.terminatedAt ?? null,
      };
    }

    return TermsVersion.create({
      termsDocument: document,
      label: command.data.label.trim(),
      content: command.data.content.trim(),
      checksum,
      status: command.data.status,
      effectiveAt: command.data.effectiveAt,
      metadata,
    });
  }
}
