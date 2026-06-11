import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument } from '@pkg/database';

import { mapTermsDocumentResponse, type TermsDocumentResponse } from '../terms.helper';
import { GetTermsDocumentsQuery } from './get-terms-documents.query';

const normalizeKeyword = (value?: string) => value?.toLowerCase();

const getDocumentLifecycle = (document: TermsDocument) => {
  if (document.isDraft) {
    return 'DRAFT';
  }

  if (document.isDeprecated) {
    return 'DEPRECATED';
  }

  return document.isScheduledForDeprecation ? 'SCHEDULED_DEPRECATION' : 'PUBLISHED';
};

const buildDocumentFilter = (query: GetTermsDocumentsQuery) => {
  if (query.scope === 'platform') {
    return { organization: null };
  }

  if (query.scope === 'organization') {
    return { organization: query.organizationId };
  }

  if (query.organizationId) {
    return {
      $or: [
        { organization: null },
        { organization: query.organizationId },
      ],
    };
  }

  return {};
};

/**
 * 약관 문서 목록 조회 핸들러
 */
@QueryHandler(GetTermsDocumentsQuery)
export class GetTermsDocumentsHandler implements IQueryHandler<GetTermsDocumentsQuery> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
  ) {}

  async execute(query: GetTermsDocumentsQuery): Promise<TermsDocumentResponse[]> {
    if (query.scope === 'organization' && !query.organizationId) {
      return [];
    }

    const documents = await this.termsDocumentRepo.find(
      buildDocumentFilter(query),
      {
        populate: ['organization'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    const keyword = normalizeKeyword(query.keyword);
    const statusFilter = normalizeKeyword(query.status);

    return documents
      .filter((document) => {
        const lifecycle = getDocumentLifecycle(document);

        if (keyword) {
          const haystack = `${document.code} ${document.title}`.toLowerCase();
          if (!haystack.includes(keyword)) {
            return false;
          }
        }

        if (!statusFilter) {
          return true;
        }

        switch (statusFilter) {
          case 'draft':
            return lifecycle === 'DRAFT';
          case 'published':
          case 'active':
            return lifecycle === 'PUBLISHED';
          case 'deprecated':
            return lifecycle === 'DEPRECATED';
          case 'scheduled_deprecation':
            return lifecycle === 'SCHEDULED_DEPRECATION';
          default:
            return true;
        }
      })
      .map((document) => mapTermsDocumentResponse(document));
  }
}
