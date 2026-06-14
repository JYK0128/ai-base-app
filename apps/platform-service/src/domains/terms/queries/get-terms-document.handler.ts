import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsVersion } from '@pkg/database';

import { GetTermsDocumentContract } from './get-terms-document.contract';
import { GetTermsDocumentAsserter } from './get-terms-document.error';
import { TermsDocumentDetailResponseDto, TermsDocumentResponseDto, TermsVersionResponseDto } from './get-terms-document.response.dto';

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

    const currentVersion = versions.find((version) => version.isCurrentlyEffective);

    return new TermsDocumentDetailResponseDto(
      new TermsDocumentResponseDto(termsDocument),
      versions.map((version) => new TermsVersionResponseDto(version)),
      currentVersion ? new TermsVersionResponseDto(currentVersion) : null,
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
