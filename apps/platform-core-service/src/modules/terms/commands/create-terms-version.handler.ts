import { createHash } from 'node:crypto';

import { Transactional } from '@mikro-orm/decorators/legacy';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsDocumentStatus, TermsVersion, TermsVersionRepository, TermsVersionStatus } from '@pkg/database';

import { CreateTermsVersionAsserter, CreateTermsVersionCommand } from './create-terms-version.helpers';

/**
 * 약관 버전 생성 핸들러
 */
@CommandHandler(CreateTermsVersionCommand)
export class CreateTermsVersionHandler implements ICommandHandler<CreateTermsVersionCommand> {
  private readonly Asserter = CreateTermsVersionAsserter;

  constructor(
    private readonly termsDocumentRepo: TermsDocumentRepository,
    private readonly termsVersionRepo: TermsVersionRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateTermsVersionCommand): Promise<TermsVersion> {
    const termsDocument = await this.identifyDocument(command.termsDocumentId);
    await this.validatePolicies(termsDocument, command.label);
    return this.processCreation(termsDocument, command);
  }

  /**
   * STEP 1: 약관 문서 식별
   */
  private async identifyDocument(termsDocumentId: string) {
    return await this.Asserter.assert(
      this.termsDocumentRepo.findOne({ id: termsDocumentId }),
      'DOCUMENT_NOT_FOUND',
    );
  }

  /**
   * STEP 2: 정책 검증
   */
  private async validatePolicies(termsDocument: TermsDocument, label: string) {
    const alreadyExists = await this.termsVersionRepo.findOne({
      termsDocument: termsDocument.id,
      label,
    });
    await this.Asserter.throwIf(!!alreadyExists, 'VERSION_ALREADY_EXISTS');
  }

  /**
   * STEP 3: 약관 버전 생성 및 상태 업데이트
   */
  private processCreation(termsDocument: TermsDocument, info: Omit<CreateTermsVersionCommand, 'termsDocumentId'>) {
    // 체크섬 생성 (SHA-256)
    const checksum = createHash('sha256').update(info.content).digest('hex');

    const termsVersion = this.termsVersionRepo.create({
      termsDocument,
      checksum,
      ...info,
    });

    if (info.status === TermsVersionStatus.PUBLISHED) {
      termsDocument.status = TermsDocumentStatus.PUBLISHED;
      termsDocument.latestVersion = termsVersion;
    }

    this.em.persist(termsVersion);
    return termsVersion;
  }
}
