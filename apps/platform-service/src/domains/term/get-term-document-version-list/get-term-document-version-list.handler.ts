import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsVersion } from '@pkg/database';

import { GetTermDocumentVersionListContract } from './get-term-document-version-list.contract';
import { GetTermDocumentVersionListAsserter } from './get-term-document-version-list.error';
import { GetTermDocumentVersionItem, GetTermDocumentVersionListResponseDto } from './get-term-document-version-list.response.dto';

@QueryHandler(GetTermDocumentVersionListContract)
export class GetTermDocumentVersionListHandler implements IQueryHandler<GetTermDocumentVersionListContract> {
  private readonly Asserter = GetTermDocumentVersionListAsserter;

  async execute(query: GetTermDocumentVersionListContract): Promise<GetTermDocumentVersionListResponseDto> {
    this.verifyVersionList(query);
    return this.processList(query);
  }

  private verifyVersionList(_query: GetTermDocumentVersionListContract): void {
    // 약관 버전 목록 조회 정책 검증 영역
  }

  private async processList(query: GetTermDocumentVersionListContract): Promise<GetTermDocumentVersionListResponseDto> {
    const listOptions = query.data.toListOptions();
    const termsDocument = await this.Asserter.assert(
      TermsDocument.findOne({ id: query.documentId }),
      'DOCUMENT_NOT_FOUND',
    );

    const versions = await TermsVersion.find(
      { termsDocument: termsDocument.id },
      {
        populate: ['termsDocument'],
        ...listOptions,
      },
    );

    return new GetTermDocumentVersionListResponseDto({
      items: versions.map((version) => new GetTermDocumentVersionItem(version)),
    });
  }
}
