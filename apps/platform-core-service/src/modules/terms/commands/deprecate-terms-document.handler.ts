import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument } from '@pkg/database';

import { getCurrentPublishedVersion, mapTermsDocumentResponse, type TermsDocumentResponse } from '../terms.helper';
import { DeprecateTermsDocumentCommand } from './deprecate-terms-document.command';
import { DeprecateTermsDocumentAsserter } from './deprecate-terms-document.error';

/**
 * 약관 문서 폐기 핸들러
 */
@CommandHandler(DeprecateTermsDocumentCommand)
export class DeprecateTermsDocumentHandler implements ICommandHandler<DeprecateTermsDocumentCommand> {
  private readonly Asserter = DeprecateTermsDocumentAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: DeprecateTermsDocumentCommand): Promise<TermsDocumentResponse> {
    const termsDocument = await this.identifyDocument(command.id);
    await this.validateDocumentState(termsDocument);
    return this.processDeprecation(termsDocument, command.deprecatedAt);
  }

  /**
   * STEP 1: 약관 문서 식별
   */
  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne(
      { id },
      { populate: ['versions', 'organization', 'latestVersion'] },
    );

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }

  /**
   * STEP 2: 폐기 가능 여부 검증
   */
  private async validateDocumentState(termsDocument: TermsDocument) {
    await this.Asserter.throwIf(!!termsDocument.deprecatedAt, 'DOCUMENT_DEPRECATION_EXISTS');

    const currentVersion = getCurrentPublishedVersion(termsDocument.versions.getItems());
    await this.Asserter.throwIf(!currentVersion, 'DOCUMENT_HAS_NO_ACTIVE_VERSION');
  }

  /**
   * STEP 3: 폐기 시점 저장
   */
  private processDeprecation(
    termsDocument: TermsDocument,
    deprecatedAt: Date,
  ): TermsDocumentResponse {
    termsDocument.deprecatedAt = deprecatedAt;
    this.em.persist(termsDocument);

    return mapTermsDocumentResponse(termsDocument);
  }
}
