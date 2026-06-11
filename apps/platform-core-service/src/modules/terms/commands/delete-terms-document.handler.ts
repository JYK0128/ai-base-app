import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsConsent, TermsDocument, TermsVersion } from '@pkg/database';

import { getCurrentPublishedVersion } from '../terms.helper';
import { DeleteTermsDocumentCommand } from './delete-terms-document.command';
import { DeleteTermsDocumentAsserter } from './delete-terms-document.error';

export type DeleteTermsDocumentResponse = {
  id: string
};

/**
 * 약관 문서 물리 삭제 핸들러
 */
@CommandHandler(DeleteTermsDocumentCommand)
export class DeleteTermsDocumentHandler implements ICommandHandler<DeleteTermsDocumentCommand> {
  private readonly Asserter = DeleteTermsDocumentAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: CoreRepository<TermsVersion>,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: DeleteTermsDocumentCommand): Promise<DeleteTermsDocumentResponse> {
    const termsDocument = await this.identifyDocument(command.id);
    await this.validateDocumentState(termsDocument);
    await this.processDeletion(termsDocument);

    return { id: termsDocument.id };
  }

  /**
   * STEP 1: 약관 문서 식별
   */
  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne(
      { id },
      { populate: ['versions', 'latestVersion'] },
    );

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }

  /**
   * STEP 2: 물리 삭제 가능 여부 검증
   */
  private async validateDocumentState(termsDocument: TermsDocument) {
    const currentVersion = getCurrentPublishedVersion(termsDocument.versions.getItems());
    await this.Asserter.throwIf(!!currentVersion, 'DOCUMENT_HAS_ACTIVE_VERSION');
  }

  /**
   * STEP 3: 관련 데이터 삭제
   */
  private async processDeletion(termsDocument: TermsDocument) {
    const versions = await this.termsVersionRepo.find(
      { termsDocument: termsDocument.id },
      { fields: ['id'] },
    );
    const versionIds = versions.map((version) => version.id);

    await this.em.nativeUpdate(TermsDocument, { id: termsDocument.id }, { latestVersion: null });

    if (versionIds.length > 0) {
      await this.em.nativeDelete(TermsConsent, { termsVersion: { $in: versionIds } });
      await this.em.nativeDelete(TermsVersion, { termsDocument: termsDocument.id });
    }

    await this.em.nativeDelete(TermsDocument, { id: termsDocument.id });
  }
}
