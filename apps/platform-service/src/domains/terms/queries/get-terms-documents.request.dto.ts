import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetTermsDocumentsRequestDto {
  @ApiPropertyOptional({ example: 'platform', enum: ['platform', 'organization'], description: '조회 scope' })
  @IsOptional()
  @IsIn(['platform', 'organization'])
  scope?: string;

  @ApiPropertyOptional({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED', 'ACTIVE', 'SCHEDULED_DEPRECATION'], description: '상태 필터' })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'DEPRECATED', 'ACTIVE', 'SCHEDULED_DEPRECATION'])
  status?: string;

  @ApiPropertyOptional({ example: 'privacy', description: '검색어' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
