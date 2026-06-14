import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CoreRepository, TermsDocument } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetTermsDocumentResponseDto } from './get-active-terms.response.dto';
import { GetTermsDocumentsContract } from './get-terms-documents.contract';
import type { GetTermsDocumentsRequestDto } from './get-terms-documents.request.dto';

const getDocumentLifecycle = (document: TermsDocument) => {
  if (document.isDraft) {
    return 'DRAFT';
  }

  if (document.isTerminated) {
    return 'TERMINATED';
  }

  return document.isScheduledForTermination ? 'SCHEDULED_TERMINATION' : 'PUBLISHED';
};

const matchesDocumentStatus = (document: TermsDocument, status?: GetTermsDocumentsRequestDto['status']) => {
  if (!status) {
    return true;
  }

  const lifecycle = getDocumentLifecycle(document);

  switch (status) {
    case 'DRAFT':
      return lifecycle === 'DRAFT';
    case 'PUBLISHED':
    case 'ACTIVE':
      return lifecycle === 'PUBLISHED';
    case 'TERMINATED':
      return lifecycle === 'TERMINATED';
    default:
      return true;
  }
};

const buildDocumentFilter = (query: GetTermsDocumentsRequestDto, organizationId?: string) => {
  if (query.scope === 'platform') {
    return { organization: null };
  }

  if (query.scope === 'organization') {
    return { organization: organizationId as string };
  }

  if (organizationId) {
    return {
      $or: [
        { organization: null },
        { organization: organizationId as string },
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

  async execute(query: GetTermsDocumentsContract): Promise<GetTermsDocumentResponseDto[]> {
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

    return documents
      .filter((document) => matchesDocumentStatus(document, query.data.status))
      .map((document) => new GetTermsDocumentResponseDto(document));
  }
}
