import type { ObjectQuery } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument, TermsDocumentScope, TermsDocumentStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';

import { FilterableRequestDto, ListRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const TERM_DOCUMENT_LIST_SORT = ['createdAt'] as const;

class GetTermDocumentListFiltersDto extends FilterableRequestDto<TermsDocument> {
  @ApiPropertyOptional({ example: TermsDocumentScope.PLATFORM, enum: TermsDocumentScope, description: '조회 scope' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(TermsDocumentScope)
  scope?: TermsDocumentScope;

  @ApiPropertyOptional({ example: TermsDocumentStatus.PUBLISHED, enum: TermsDocumentStatus, description: '약관 상태 필터' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(TermsDocumentStatus)
  status?: TermsDocumentStatus;

  toFilterQuery(): ObjectQuery<TermsDocument> {
    const queries: ObjectQuery<TermsDocument>[] = [];
    let queryFilter: ObjectQuery<TermsDocument>;

    if (this.status === TermsDocumentStatus.DRAFT) {
      queries.push({ metadata: { publishedAt: null } });
    }
    else if (this.status === TermsDocumentStatus.PUBLISHED) {
      queries.push({
        metadata: {
          publishedAt: { $ne: null },
        },
        $or: [
          { metadata: { terminatedAt: null } },
          { metadata: { terminatedAt: { $gt: new Date() } } },
        ],
      });
    }
    else if (this.status === TermsDocumentStatus.TERMINATED) {
      queries.push({
        metadata: {
          publishedAt: { $ne: null },
          terminatedAt: { $lte: new Date() },
        },
      });
    }

    if (queries.length === 0) {
      queryFilter = {};
    }
    else if (queries.length === 1) {
      queryFilter = queries[0];
    }
    else {
      queryFilter = { $and: queries };
    }

    return queryFilter;
  }
}

export class GetTermDocumentListRequestDto extends ListRequestDto<TermsDocument> {
  @ApiPropertyOptional({ type: () => GetTermDocumentListFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetTermDocumentListFiltersDto)
  filters: GetTermDocumentListFiltersDto = new GetTermDocumentListFiltersDto();

  @ApiPropertyOptional({ description: '정렬 필드', isArray: true, enum: TERM_DOCUMENT_LIST_SORT })
  @IsOptional()
  @IsIn(TERM_DOCUMENT_LIST_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<TermsDocument>> = ['createdAt'];

  @ApiPropertyOptional({ description: '정렬 방향', isArray: true, enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc'];
}
