import type { ObjectQuery } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TermsVersion } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';

import { FilterableRequestDto, ListRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const TERM_DOCUMENT_VERSION_LIST_SORT = ['effectiveAt', 'createdAt'] as const;

class GetTermDocumentVersionListFiltersDto extends FilterableRequestDto<TermsVersion> {
  toFilterQuery(): ObjectQuery<TermsVersion> {
    return {};
  }
}

export class GetTermDocumentVersionListRequestDto extends ListRequestDto<TermsVersion> {
  @ApiPropertyOptional({ type: () => GetTermDocumentVersionListFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetTermDocumentVersionListFiltersDto)
  filters: GetTermDocumentVersionListFiltersDto = new GetTermDocumentVersionListFiltersDto();

  @ApiPropertyOptional({ description: '정렬 필드', isArray: true, enum: TERM_DOCUMENT_VERSION_LIST_SORT })
  @IsOptional()
  @IsIn(TERM_DOCUMENT_VERSION_LIST_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<TermsVersion>> = ['effectiveAt', 'createdAt'];

  @ApiPropertyOptional({ description: '정렬 방향', isArray: true, enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc', 'desc'];
}
