import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildTermsDocumentScopeFilter, buildTermsDocumentStatusFilter, CoreRepository, TermsDocument, TermsDocumentStatus, TermsVersionStatus } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetTermsDocumentResponseDto } from '../../terms/queries/get-terms-document.response.dto';
import { GetActiveTermsContract } from './get-active-terms.contract';

@QueryHandler(GetActiveTermsContract)
export class GetActiveTermsHandler implements IQueryHandler<GetActiveTermsContract> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    private readonly cls: ClsService,
  ) {}

  async execute(): Promise<GetTermsDocumentResponseDto[]> {
    const organizationId = this.cls.get<string>('organizationId');
    if (!organizationId) {
      return [];
    }

    const statusFilter = buildTermsDocumentStatusFilter(TermsDocumentStatus.PUBLISHED);
    const scopeFilter = buildTermsDocumentScopeFilter(organizationId);
    const currentPublishedVersionFilter = {
      versions: {
        $some: {
          status: TermsVersionStatus.PUBLISHED,
          effectiveAt: { $lte: new Date() },
        },
      },
    };

    const documents = await this.termsDocumentRepo.find(
      { $and: [statusFilter, scopeFilter, currentPublishedVersionFilter] },
      {
        populate: ['organization', 'versions'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return documents.map((document) => new GetTermsDocumentResponseDto(document));
  }
}
