import type { FilterQuery } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TermsDocument } from '@pkg/database';
import { TermsDocumentScope } from '@pkg/database';
import type { AuthOrganizationContext } from '@pkg/shared/server';
import { ClsService } from 'nestjs-cls';

import { GetTermDocumentItem } from '../get-term-document/get-term-document-item.response.dto';
import { GetTermDocumentListContract } from './get-term-document-list.contract';
import { GetTermDocumentListResponseDto } from './get-term-document-list.response.dto';

@QueryHandler(GetTermDocumentListContract)
export class GetTermDocumentListHandler implements IQueryHandler<GetTermDocumentListContract> {
  constructor(private readonly cls: ClsService) {}

  async execute(query: GetTermDocumentListContract): Promise<GetTermDocumentListResponseDto> {
    const organization = this.identifyOrganization();
    this.verifyTermDocumentList(organization, query);
    return this.processList(query, organization);
  }

  private identifyOrganization(): AuthOrganizationContext | undefined {
    return this.cls.get<AuthOrganizationContext>('organization');
  }

  private verifyTermDocumentList(
    _organization: AuthOrganizationContext | undefined,
    _query: GetTermDocumentListContract,
  ): void {
    // 약관 문서 목록 조회 정책 검증 영역
  }

  private async processList(
    query: GetTermDocumentListContract,
    organization: AuthOrganizationContext | undefined,
  ): Promise<GetTermDocumentListResponseDto> {
    const listOptions = query.data.toListOptions();
    if (!organization) {
      return new GetTermDocumentListResponseDto({
        items: [],
      });
    }

    let scopeFilter: FilterQuery<TermsDocument>;

    if (query.data.filters.scope === TermsDocumentScope.PLATFORM) {
      scopeFilter = { organization: null };
    }
    else if (query.data.filters.scope === TermsDocumentScope.ORGANIZATION) {
      scopeFilter = { organization: organization.id };
    }
    else {
      scopeFilter = {
        $or: [
          { organization: null },
          { organization: organization.id },
        ],
      };
    }

    const documents = await TermsDocument.find(
      {
        ...scopeFilter,
        ...query.data.toFilterQuery(),
      } as FilterQuery<TermsDocument>,
      {
        populate: ['organization', 'versions'],
        orderBy: listOptions.orderBy,
      },
    );

    return new GetTermDocumentListResponseDto({
      items: documents.map((document) => new GetTermDocumentItem(document)),
    });
  }
}
