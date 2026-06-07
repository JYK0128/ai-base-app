import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository } from '@pkg/database';

import { mapTermsDocumentResponse, type TermsDocumentResponse } from '../terms.helper';
import { CancelDeprecationTermsDocumentCommand } from './cancel-deprecation-terms-document.command';
import { CancelDeprecationTermsDocumentAsserter } from './cancel-deprecation-terms-document.error';

/**
 * 약관 문서 폐기 예약 취소 핸들러
 */
@CommandHandler(CancelDeprecationTermsDocumentCommand)
export class CancelDeprecationTermsDocumentHandler implements ICommandHandler<CancelDeprecationTermsDocumentCommand> {
  private readonly Asserter = CancelDeprecationTermsDocumentAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CancelDeprecationTermsDocumentCommand): Promise<TermsDocumentResponse> {
    const termsDocument = await this.identifyDocument(command.id);
    await this.validateDocumentState(termsDocument);
    return this.processCancellation(termsDocument);
  }

  /**
   * STEP 1: 약관 문서 식별
   */
  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne(
      { id },
      { populate: ['organization'] },
    );

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }

  /**
   * STEP 2: 취소 가능 여부 검증
   */
  private async validateDocumentState(termsDocument: TermsDocument) {
    await this.Asserter.throwIf(
      !termsDocument.isScheduledForDeprecation,
      'DOCUMENT_DEPRECATION_NOT_SCHEDULED',
    );
  }

  /**
   * STEP 3: 폐기 예약 해제
   */
  private processCancellation(termsDocument: TermsDocument): TermsDocumentResponse {
    termsDocument.deprecatedAt = undefined;
    this.em.persist(termsDocument);

    return mapTermsDocumentResponse(termsDocument);
  }
}
