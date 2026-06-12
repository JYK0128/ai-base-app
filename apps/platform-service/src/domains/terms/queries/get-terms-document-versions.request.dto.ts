import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetTermsDocumentVersionsRequestDto {
  @ApiPropertyOptional({ example: 'v1.0.0', description: '버전 검색어' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
