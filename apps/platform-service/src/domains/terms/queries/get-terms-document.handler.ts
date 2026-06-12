import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsVersion } from '@pkg/database';

import { mapTermsDocumentDetailResponse } from '../terms.helper';
import { GetTermsDocumentContract } from './get-terms-document.contract';
import { GetTermsDocumentAsserter } from './get-terms-document.error';
import type { TermsDocumentDetailResponseDto } from './get-terms-document.response.dto';

@QueryHandler(GetTermsDocumentContract)
export class GetTermsDocumentHandler implements IQueryHandler<GetTermsDocumentContract> {
  private readonly Asserter = GetTermsDocumentAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: CoreRepository<TermsVersion>,
  ) {}

  async execute(query: GetTermsDocumentContract): Promise<TermsDocumentDetailResponseDto> {
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

  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne(
      { id },
      { populate: ['organization', 'latestVersion'] },
    );

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }
}
