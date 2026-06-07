import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsVersion, TermsVersionRepository } from '@pkg/database';

import { mapTermsVersionResponse, type TermsVersionResponse } from '../terms.mapper';
import { GetTermsDocumentVersionsAsserter } from './get-terms-document-versions.error';
import { GetTermsDocumentVersionsQuery } from './get-terms-document-versions.query';

const normalizeKeyword = (value?: string) => value?.toLowerCase() ?? '';

/**
 * 약관 문서 버전 목록 조회 핸들러
 */
@QueryHandler(GetTermsDocumentVersionsQuery)
export class GetTermsDocumentVersionsHandler implements IQueryHandler<GetTermsDocumentVersionsQuery> {
  private readonly Asserter = GetTermsDocumentVersionsAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: TermsVersionRepository,
  ) {}

  async execute(query: GetTermsDocumentVersionsQuery): Promise<TermsVersionResponse[]> {
    await this.identifyDocument(query.id);

    const versions = await this.termsVersionRepo.find(
      { termsDocument: query.id },
      {
        populate: ['termsDocument'],
        orderBy: { effectiveAt: 'DESC', createdAt: 'DESC' },
      },
    );

    const keyword = normalizeKeyword(query.keyword);
    return versions
      .filter((version) => {
        if (!keyword) return true;

        const haystack = `${version.label} ${version.content} ${version.status}`.toLowerCase();
        return haystack.includes(keyword);
      })
      .map((version) => mapTermsVersionResponse(version));
  }

  /**
   * STEP 1: 약관 문서 식별
   */
  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne({ id });

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }
}
