import { ApiPropertyOptional } from '@nestjs/swagger';
import { TermsVersion } from '@pkg/database';

import { type FilterRequestDto,
         type ListRequestDto,
         SortDirection,
         type SortKey } from '@/common/interfaces';

export class GetTermsDocumentVersionsRequestDto implements ListRequestDto<TermsVersion> {
  filter: FilterRequestDto<TermsVersion> = {};

  @ApiPropertyOptional({
    description: '정렬 필드',
    example: ['effectiveAt', 'createdAt'],
    default: ['effectiveAt', 'createdAt'],
    isArray: true,
  })
  sort!: Array<SortKey<TermsVersion>>;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    example: [SortDirection.DESC, SortDirection.DESC],
    default: [SortDirection.DESC, SortDirection.DESC],
    isArray: true,
  })
  direction!: SortDirection[];

  @ApiPropertyOptional({ description: '오프셋', example: 0, default: 0 })
  offset!: number;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  limit!: number;
}
