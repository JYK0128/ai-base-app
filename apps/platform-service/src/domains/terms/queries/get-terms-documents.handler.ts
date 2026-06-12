import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { TermsDocumentResponseDto } from './get-active-terms.response.dto';
import { GetTermsDocumentsContract } from './get-terms-documents.contract';
import type { GetTermsDocumentsRequestDto } from './get-terms-documents.request.dto';

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

const buildDocumentFilter = (query: GetTermsDocumentsRequestDto, organizationId?: string) => {
  if (query.scope === 'platform') {
    return { organization: null };
  }

  if (query.scope === 'organization') {
    return { organization: organizationId };
  }

  if (organizationId) {
    return {
      $or: [
        { organization: null },
        { organization: organizationId },
      ],
    };
  }

  return {};
};

@QueryHandler(GetTermsDocumentsContract)
export class GetTermsDocumentsHandler implements IQueryHandler<GetTermsDocumentsContract> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetTermsDocumentsContract): Promise<TermsDocumentResponseDto[]> {
    const organizationId = this.cls.get('organizationId');

    if (query.data.scope === 'organization' && !organizationId) {
      return [];
    }

    const documents = await this.termsDocumentRepo.find(
      buildDocumentFilter(query.data, organizationId),
      {
        populate: ['organization', 'versions'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    const keyword = normalizeKeyword(query.data.keyword);
    const statusFilter = normalizeKeyword(query.data.status);

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
      .map((document) => new TermsDocumentResponseDto(document));
  }
}
