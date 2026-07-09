import { createHash } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion, TermsVersionStatus } from '@pkg/database';

import { UpdateTermDocumentVersionContract } from './update-term-document-version.contract';
import { UpdateTermDocumentVersionResponseDto } from './update-term-document-version.response.dto';

type TermsVersionMetadata = {
  reason?: string
  summary?: string
};

function buildTermsVersionMetadata(metadata: Record<string, unknown> | null | undefined): TermsVersionMetadata {
  const nextMetadata: TermsVersionMetadata = {};
  const source = metadata as { reason?: unknown, summary?: unknown } | null | undefined;

  if (typeof source?.summary === 'string' && source.summary.trim()) {
    nextMetadata.summary = source.summary.trim();
  }

  if (typeof source?.reason === 'string' && source.reason.trim()) {
    nextMetadata.reason = source.reason.trim();
  }

  return nextMetadata;
}

@CommandHandler(UpdateTermDocumentVersionContract)
export class UpdateTermDocumentVersionHandler implements ICommandHandler<UpdateTermDocumentVersionContract> {
  constructor() {}

  @Transactional()
  async execute(command: UpdateTermDocumentVersionContract): Promise<UpdateTermDocumentVersionResponseDto> {
    const document = await this.identifyDocument(command.documentId);
    this.verifyUpdate(document);
    const version = await this.identifyVersion(command.documentId, command.versionId);
    await this.processUpdate(command, document, version);

    return new UpdateTermDocumentVersionResponseDto(version.id);
  }

  private async identifyDocument(documentId: string): Promise<TermsDocument> {
    const document = await TermsDocument.findOne({ id: documentId });

    if (!document) {
      throw new NotFoundException('DOCUMENT_NOT_FOUND');
    }

    return document;
  }

  private async identifyVersion(documentId: string, versionId: string): Promise<TermsVersion> {
    const version = await TermsVersion.findOne({
      id: versionId,
      termsDocument: documentId,
    });

    if (!version) {
      throw new NotFoundException('VERSION_NOT_FOUND');
    }

    return version;
  }

  private verifyUpdate(document: TermsDocument): void {
    if (document.isTerminated) {
      throw new ConflictException({
        code: 'TERMINATED_DOCUMENT_CANNOT_UPDATE_VERSION',
        message: '종료된 문서는 버전을 수정할 수 없습니다.',
      });
    }
  }

  private async processUpdate(
    command: UpdateTermDocumentVersionContract,
    document: TermsDocument,
    version: TermsVersion,
  ): Promise<void> {
    const nextLabel = command.data.label?.trim() ?? version.label;
    const nextEffectiveAt = command.data.effectiveAt ?? version.effectiveAt;
    const nextStatus = command.data.status ?? version.status;
    const nextContent = command.data.content?.trim() ?? version.content;
    const versionMetadata = buildTermsVersionMetadata(version.metadata);

    if (command.data.content !== undefined && !nextContent) {
      throw new ConflictException({
        code: 'CONTENT_REQUIRED_FOR_UPDATE',
        message: '버전 내용을 업데이트하려면 content 필드가 필요합니다.',
      });
    }

    if (command.data.summary !== undefined) {
      const summary = command.data.summary.trim();
      if (summary) {
        versionMetadata.summary = summary;
      }
      else {
        delete versionMetadata.summary;
      }
    }

    if (command.data.reason !== undefined) {
      const reason = command.data.reason.trim();
      if (reason) {
        versionMetadata.reason = reason;
      }
      else {
        delete versionMetadata.reason;
      }
    }

    const checksum = createHash('sha256').update(nextContent).digest('hex');

    await TermsVersion.nativeUpdate(
      {
        id: version.id,
        termsDocument: document.id,
      },
      {
        label: nextLabel,
        content: nextContent,
        checksum,
        status: nextStatus,
        effectiveAt: nextEffectiveAt,
        metadata: versionMetadata,
      },
    );

    if (nextStatus === TermsVersionStatus.PUBLISHED) {
      await TermsDocument.nativeUpdate(
        { id: document.id },
        {
          metadata: {
            publishedAt: document.metadata?.publishedAt ?? new Date(),
            terminatedAt: null,
          },
        },
      );
    }
  }
}
