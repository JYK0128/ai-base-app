import type { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildTermsDocumentScopeFilter, buildTermsDocumentStatusFilter, CoreRepository, TermsDocument } from '@pkg/database';
import { ClsService } from 'nestjs-cls';

import { GetTermsDocumentResponseDto } from './get-terms-document.response.dto';
import { GetTermsDocumentsContract } from './get-terms-documents.contract';

@QueryHandler(GetTermsDocumentsContract)
export class GetTermsDocumentsHandler implements IQueryHandler<GetTermsDocumentsContract> {
  constructor(
    @InjectRepository(TermsDocument)
    private readonly termsDocumentRepo: CoreRepository<TermsDocument>,
    private readonly cls: ClsService,
  ) {}

  async execute(query: GetTermsDocumentsContract): Promise<GetTermsDocumentResponseDto[]> {
    const organizationId = this.cls.get('organizationId');

    if (!organizationId) {
      return [];
    }

    const documents = await this.termsDocumentRepo.find(
      this.buildTermsDocumentsQueryFilter(organizationId, query.data.scope, query.data.status),
      {
        populate: ['organization', 'versions'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return documents.map((document) => new GetTermsDocumentResponseDto(document));
  }

  private buildTermsDocumentsQueryFilter(
    organizationId: Parameters<typeof buildTermsDocumentScopeFilter>[0],
    scope: Parameters<typeof buildTermsDocumentScopeFilter>[1],
    status: Parameters<typeof buildTermsDocumentStatusFilter>[0],
  ): FilterQuery<TermsDocument> {
    const filters: FilterQuery<TermsDocument>[] = [
      buildTermsDocumentScopeFilter(organizationId, scope),
    ];

    if (status) {
      filters.push(buildTermsDocumentStatusFilter(status));
    }

    let queryFilter: FilterQuery<TermsDocument> = {};

    if (filters.length === 1) {
      queryFilter = filters[0];
    }

    if (filters.length > 1) {
      queryFilter = { $and: filters };
    }

    return queryFilter;
  }
}
