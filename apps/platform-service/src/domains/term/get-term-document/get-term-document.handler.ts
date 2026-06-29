import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { GetTermDocumentVersionItem } from '../get-term-document-version-list/get-term-document-version-list.response.dto';
import { GetTermDocumentContract } from './get-term-document.contract';
import { GetTermDocumentAsserter } from './get-term-document.error';
import { GetTermDocumentDetailResponseDto } from './get-term-document.response.dto';
import { GetTermDocumentItem } from './get-term-document-item.response.dto';

@QueryHandler(GetTermDocumentContract)
export class GetTermDocumentHandler implements IQueryHandler<GetTermDocumentContract> {
  private readonly Asserter = GetTermDocumentAsserter;

  async execute(query: GetTermDocumentContract): Promise<GetTermDocumentDetailResponseDto> {
    this.verifyDocument(query);
    return this.processDetail(query);
  }

  private verifyDocument(_query: GetTermDocumentContract): void {
    // 약관 문서 상세 조회 정책 검증 영역
  }

  private async processDetail(query: GetTermDocumentContract): Promise<GetTermDocumentDetailResponseDto> {
    const termsDocument = await this.Asserter.assert(
      TermsDocument.findOne(
        { id: query.data.id },
        { populate: ['organization'] },
      ),
      'DOCUMENT_NOT_FOUND',
    );

    const versions = await TermsVersion.find(
      { termsDocument: termsDocument.id },
      {
        populate: ['termsDocument'],
        orderBy: { effectiveAt: 'DESC', createdAt: 'DESC' },
      },
    );

    const currentVersion = versions.find((version) => version.isCurrentlyEffective);

    return new GetTermDocumentDetailResponseDto(
      new GetTermDocumentItem(termsDocument),
      versions.map((version) => new GetTermDocumentVersionItem(version)),
      currentVersion ? new GetTermDocumentVersionItem(currentVersion) : null,
    );
  }
}
