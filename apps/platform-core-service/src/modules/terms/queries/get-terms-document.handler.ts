import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsVersion, TermsVersionRepository } from '@pkg/database';

import { mapTermsDocumentDetailResponse, type TermsDocumentDetailResponse } from '../terms.helper';
import { GetTermsDocumentAsserter } from './get-terms-document.error';
import { GetTermsDocumentQuery } from './get-terms-document.query';

/**
 * 약관 문서 상세 조회 핸들러
 */
@QueryHandler(GetTermsDocumentQuery)
export class GetTermsDocumentHandler implements IQueryHandler<GetTermsDocumentQuery> {
  private readonly Asserter = GetTermsDocumentAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: TermsVersionRepository,
  ) {}

  async execute(query: GetTermsDocumentQuery): Promise<TermsDocumentDetailResponse> {
    const termsDocument = await this.identifyDocument(query.id);
    const versions = await this.termsVersionRepo.find(
      { termsDocument: termsDocument.id },
      {
        populate: ['termsDocument'],
        orderBy: { effectiveAt: 'DESC', createdAt: 'DESC' },
      },
    );

    return mapTermsDocumentDetailResponse(termsDocument, versions);
  }

  /**
   * STEP 1: 약관 문서 식별
   */
  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne(
      { id },
      { populate: ['organization', 'latestVersion'] },
    );

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }
}
