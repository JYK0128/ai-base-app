import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument, TermsDocumentRepository, TermsDocumentStatus, TermsGroupType } from '@pkg/database';

export class GetActiveTermsQuery {
  constructor(readonly organizationId?: string) {}
}

@QueryHandler(GetActiveTermsQuery)
export class GetActiveTermsHandler implements IQueryHandler<GetActiveTermsQuery> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: TermsDocumentRepository,
  ) {}

  async execute(query: GetActiveTermsQuery): Promise<TermsDocument[]> {
    return this.termsDocumentRepo.find({
      status: TermsDocumentStatus.PUBLISHED,
      $or: [
        { groupType: TermsGroupType.PLATFORM },
        { groupType: TermsGroupType.ORGANIZATION, organization: query.organizationId },
      ],
    }, {
      populate: ['versions'],
      orderBy: { createdAt: 'DESC' },
    });
  }
}
