import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsVersion } from '@pkg/database';

import { GetTermsDocumentContract } from './get-terms-document.contract';
import { GetTermsDocumentAsserter } from './get-terms-document.error';
import { GetTermsDocumentDetailResponseDto, GetTermsDocumentResponseDto, GetTermsDocumentVersionResponseDto } from './get-terms-document.response.dto';

@QueryHandler(GetTermsDocumentContract)
export class GetTermsDocumentHandler implements IQueryHandler<GetTermsDocumentContract> {
  private readonly Asserter = GetTermsDocumentAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    @InjectRepository(TermsVersion)
    private readonly termsVersionRepo: CoreRepository<TermsVersion>,
  ) {}

  async execute(query: GetTermsDocumentContract): Promise<GetTermsDocumentDetailResponseDto> {
    const termsDocument = await this.identifyDocument(query.data.id);
    const versions = await this.termsVersionRepo.find(
      { termsDocument: termsDocument.id },
      {
        populate: ['termsDocument'],
        orderBy: { effectiveAt: 'DESC', createdAt: 'DESC' },
      },
    );

    const currentVersion = versions.find((version) => version.isCurrentlyEffective);

    return new GetTermsDocumentDetailResponseDto(
      new GetTermsDocumentResponseDto(termsDocument),
      versions.map((version) => new GetTermsDocumentVersionResponseDto(version)),
      currentVersion ? new GetTermsDocumentVersionResponseDto(currentVersion) : null,
    );
  }

  private async identifyDocument(id: string): Promise<TermsDocument> {
    const termsDocument = await this.termsDocumentRepo.findOne(
      { id },
      { populate: ['organization'] },
    );

    return this.Asserter.assert(termsDocument, 'DOCUMENT_NOT_FOUND');
  }
}
