import { ApiPropertyOptional } from '@nestjs/swagger';
import type { TermsDocument } from '@pkg/database';
import { IsIn, IsOptional } from 'class-validator';

import { type ListRequestDto, SortDirection } from '@/common/interfaces';

export class GetTermsDocumentsRequestDto implements ListRequestDto<TermsDocument> {
  @ApiPropertyOptional({
    description: '정렬 필드',
    example: ['createdAt'],
    default: ['createdAt'],
    isArray: true,
  })
  sort!: Array<keyof TermsDocument & string>;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    example: [SortDirection.DESC],
    default: [SortDirection.DESC],
    isArray: true,
  })
  direction!: SortDirection[];

  @ApiPropertyOptional({
    description: '오프셋',
    example: 0,
    default: 0,
  })
  offset!: number;

  @ApiPropertyOptional({
    description: '페이지 크기',
    example: 20,
    default: 20,
  })
  limit!: number;

  @ApiPropertyOptional({ example: 'platform', enum: ['platform', 'organization'], description: '조회 scope' })
  @IsOptional()
  @IsIn(['platform', 'organization'])
  scope?: 'platform' | 'organization';

  @ApiPropertyOptional({
    example: 'PUBLISHED',
    enum: ['DRAFT', 'PUBLISHED', 'TERMINATED', 'ACTIVE'],
    description: '약관 상태 필터',
  })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'TERMINATED', 'ACTIVE'])
  status?: 'DRAFT' | 'PUBLISHED' | 'TERMINATED' | 'ACTIVE';

}
