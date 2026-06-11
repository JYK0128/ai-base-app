import { createHash } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsDocumentStatus, TermsVersion } from '@pkg/database';

import { mapTermsVersionResponse, type TermsVersionResponse } from '../terms.helper';
import { CreateTermsVersionCommand } from './create-terms-version.command';
import { CreateTermsVersionAsserter } from './create-terms-version.error';

/**
 * 약관 버전 생성 핸들러
 */
@CommandHandler(CreateTermsVersionCommand)
export class CreateTermsVersionHandler implements ICommandHandler<CreateTermsVersionCommand> {
  private readonly Asserter = CreateTermsVersionAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: CoreRepository<TermsVersion>,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateTermsVersionCommand): Promise<TermsVersionResponse> {
    const termsDocument = await this.identifyDocument(command.termsDocumentId);
    await this.validateDocumentState(termsDocument);
    await this.validatePolicies(termsDocument, command.label);
    return this.processCreation(termsDocument, command);
  }

  /**
   * STEP 1: 약관 문서 식별
   */
  private async identifyDocument(termsDocumentId: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne(
      { id: termsDocumentId },
      { populate: ['versions', 'latestVersion', 'organization'] },
    );

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }

  /**
   * STEP 2: 문서 상태 검증
   */
  private async validateDocumentState(termsDocument: TermsDocument) {
    await this.Asserter.throwIf(termsDocument.isDeprecated, 'DOCUMENT_DEPRECATED');
  }

  /**
   * STEP 3: 정책 검증
   */
  private async validatePolicies(termsDocument: TermsDocument, label: string) {
    const alreadyExists = await this.termsVersionRepo.findOne({
      termsDocument: termsDocument.id,
      label,
    });

    await this.Asserter.throwIf(!!alreadyExists, 'VERSION_ALREADY_EXISTS');
  }

  /**
   * STEP 4: 약관 버전 생성 및 상태 업데이트
   */
  private processCreation(
    termsDocument: TermsDocument,
    info: Omit<CreateTermsVersionCommand, 'termsDocumentId'>,
  ): TermsVersionResponse {
    const checksum = createHash('sha256').update(info.content).digest('hex');

    const termsVersion = this.termsVersionRepo.create({
      termsDocument,
      checksum,
      ...info,
    });

    if (termsVersion.isPublished) {
      termsDocument.status = TermsDocumentStatus.PUBLISHED;
      termsDocument.latestVersion = termsVersion;
    }

    this.em.persist(termsVersion);
    return mapTermsVersionResponse(termsVersion);
  }
}
