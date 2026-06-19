import { ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument, TermsDocumentScope, TermsDocumentStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { ValidateNested } from 'class-validator';

import { type FilterRequestDto, type ListRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

class GetTermsDocumentPageFiltersDto {
  @ApiPropertyOptional({ example: TermsDocumentScope.PLATFORM, enum: TermsDocumentScope, description: '조회 scope' })
  @IsOptional()
  @IsEnum(TermsDocumentScope)
  scope?: TermsDocumentScope;

  @ApiPropertyOptional({ example: TermsDocumentStatus.PUBLISHED, enum: TermsDocumentStatus, description: '약관 상태 필터' })
  @IsOptional()
  @IsEnum(TermsDocumentStatus)
  status?: TermsDocumentStatus;
}

export class GetTermsDocumentPageRequestDto implements ListRequestDto<TermsDocument> {
  filter: FilterRequestDto<TermsDocument> = {};
  @ApiPropertyOptional({ description: '정렬 필드', example: ['createdAt'], default: ['createdAt'], isArray: true })
  sort!: Array<SortKey<TermsDocument>>;

  @ApiPropertyOptional({ description: '정렬 방향', enum: SortDirection, example: [SortDirection.DESC], default: [SortDirection.DESC], isArray: true })
  direction!: SortDirection[];

  @ApiPropertyOptional({ description: '오프셋', example: 0, default: 0 })
  offset!: number;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  limit!: number;

  @ApiPropertyOptional({ type: () => GetTermsDocumentPageFiltersDto, description: '필터 조건' })
  @ValidateNested()
  @Type(() => GetTermsDocumentPageFiltersDto)
  filters?: GetTermsDocumentPageFiltersDto;
}
