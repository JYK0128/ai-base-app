import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsDocumentStatus } from '@pkg/database';

import { GetActiveTermsAsserter, GetActiveTermsQuery } from './get-active-terms.helpers';

/**
 * 활성 약관 목록 조회 핸들러
 */
@QueryHandler(GetActiveTermsQuery)
export class GetActiveTermsHandler implements IQueryHandler<GetActiveTermsQuery> {
  private readonly Asserter = GetActiveTermsAsserter;

  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
  ) {}

  async execute(query: GetActiveTermsQuery): Promise<TermsDocument[]> {
    return this.termsDocumentRepo.find({
      status: TermsDocumentStatus.PUBLISHED,
      $or: [
        { organization: null },
        ...(query.organizationId ? [{ organization: query.organizationId }] : []),
      ],
    }, {
      populate: ['versions'],
      orderBy: { createdAt: 'DESC' },
    });
  }
}
