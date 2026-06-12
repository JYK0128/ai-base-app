import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsVersion } from '@pkg/database';

import { mapTermsVersionResponse } from '../terms.helper';
import { TermsVersionResponseDto } from './get-terms-document.response.dto';
import { GetTermsDocumentVersionsContract } from './get-terms-document-versions.contract';
import { GetTermsDocumentVersionsAsserter } from './get-terms-document-versions.error';

const normalizeKeyword = (value?: string) => value?.toLowerCase();

@QueryHandler(GetTermsDocumentVersionsContract)
export class GetTermsDocumentVersionsHandler implements IQueryHandler<GetTermsDocumentVersionsContract> {
  private readonly Asserter = GetTermsDocumentVersionsAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: CoreRepository<TermsVersion>,
  ) {}

  async execute(query: GetTermsDocumentVersionsContract): Promise<TermsVersionResponseDto[]> {
    await this.identifyDocument(query.data.id);

    const versions = await this.termsVersionRepo.find(
      { termsDocument: query.data.id },
      {
        populate: ['termsDocument'],
        orderBy: { effectiveAt: 'DESC', createdAt: 'DESC' },
      },
    );

    const keyword = normalizeKeyword(query.data.keyword);

    return versions
      .filter((version) => {
        if (!keyword) return true;

        const haystack = `${version.label} ${version.content} ${version.status}`.toLowerCase();
        return haystack.includes(keyword);
      })
      .map((version) => mapTermsVersionResponse(version));
  }

  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne({ id });

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }
}
