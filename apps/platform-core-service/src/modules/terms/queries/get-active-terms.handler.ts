import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument, TermsDocumentStatus } from '@pkg/database';

import { getCurrentPublishedVersion, mapTermsDocumentResponse, type TermsDocumentResponse } from '../terms.helper';
import { GetActiveTermsQuery } from './get-active-terms.query';

/**
 * 활성 약관 목록 조회 핸들러
 */
@QueryHandler(GetActiveTermsQuery)
export class GetActiveTermsHandler implements IQueryHandler<GetActiveTermsQuery> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
  ) {}

  async execute(query: GetActiveTermsQuery): Promise<TermsDocumentResponse[]> {
    const documents = await this.termsDocumentRepo.find(
      {
        status: TermsDocumentStatus.PUBLISHED,
        ...(query.organizationId
          ? {
            $or: [
              { organization: null },
              { organization: query.organizationId },
            ],
          }
          : {
            organization: null,
          }),
      },
      {
        populate: ['organization', 'versions'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return documents
      .filter((document) => !!getCurrentPublishedVersion(document.versions.getItems()))
      .filter((document) => !document.isDeprecated)
      .map((document) => mapTermsDocumentResponse(document));
  }
}
