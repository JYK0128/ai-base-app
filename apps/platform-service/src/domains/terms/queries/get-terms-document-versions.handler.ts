import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsVersion } from '@pkg/database';

import { GetTermsDocumentVersionResponseDto } from './get-terms-document.response.dto';
import { GetTermsDocumentVersionsContract } from './get-terms-document-versions.contract';
import { GetTermsDocumentVersionsAsserter } from './get-terms-document-versions.error';

@QueryHandler(GetTermsDocumentVersionsContract)
export class GetTermsDocumentVersionsHandler implements IQueryHandler<GetTermsDocumentVersionsContract> {
  private readonly Asserter = GetTermsDocumentVersionsAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: CoreRepository<TermsVersion>,
  ) {}

  async execute(query: GetTermsDocumentVersionsContract): Promise<GetTermsDocumentVersionResponseDto[]> {
    await this.identifyDocument(query.documentId);

    const versions = await this.termsVersionRepo.find(
      { termsDocument: query.documentId },
      {
        populate: ['termsDocument'],
        orderBy: query.data.sort.map((field, index) => ({
          [field]: query.data.direction[index] ?? query.data.direction[0] ?? 'desc',
        })),
        offset: query.data.offset,
        limit: query.data.limit,
      },
    );

    return versions.map((version) => new GetTermsDocumentVersionResponseDto(version));
  }

  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne({ id });

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }
}
