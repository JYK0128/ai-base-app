import { ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument, TermsDocumentScope, TermsDocumentStatus } from '@pkg/database';
import { IsEnum, IsOptional } from 'class-validator';

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

  @ApiPropertyOptional({
    example: 'platform',
    enum: TermsDocumentScope,
    description: '조회 scope',
  })
  @IsOptional()
  @IsEnum(TermsDocumentScope)
  scope?: TermsDocumentScope;

  @ApiPropertyOptional({
    example: 'PUBLISHED',
    enum: TermsDocumentStatus,
    description: '약관 상태 필터',
  })
  @IsOptional()
  @IsEnum(TermsDocumentStatus)
  status?: TermsDocumentStatus;
}
