import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetTermsDocumentsQueryDto {
  @ApiPropertyOptional({ example: 'platform', enum: ['platform', 'organization'], description: '조회 scope' })
  @IsOptional()
  @IsIn(['platform', 'organization'])
  scope?: string;

  @ApiPropertyOptional({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED', 'ACTIVE', 'SCHEDULED_DEPRECATION'], description: '상태 필터' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'privacy', description: '검색어' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class GetTermsDocumentVersionsQueryDto {
  @ApiPropertyOptional({ example: 'v1.0.0', description: '버전 검색어' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class TermsDocumentParamDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7094', description: '약관 문서 식별자' })
  @IsString()
  id!: string;
}

export class CreateTermsDocumentDto {
  @ApiProperty({ example: 'SERVICE_TOS', description: '약관 문서 코드' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: '서비스 이용약관', description: '약관 문서 제목' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: true, description: '필수 약관 여부' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({ example: 'platform', enum: ['platform', 'organization'], description: '생성 scope' })
  @IsIn(['platform', 'organization'])
  scope!: string;
}

export class DeprecateTermsDocumentDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7094', description: '약관 문서 식별자' })
  @IsString()
  id!: string;

  @ApiProperty({ example: '2026-06-20T00:00:00.000Z', description: '폐기 시점' })
  @IsDateString()
  deprecatedAt!: string;
}

export class CancelDeprecationTermsDocumentDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7094', description: '약관 문서 식별자' })
  @IsString()
  id!: string;
}

export class DeleteTermsDocumentDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7094', description: '약관 문서 식별자' })
  @IsString()
  id!: string;
}

export class CreateTermsVersionDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7089', description: '약관 문서 식별자' })
  @IsString()
  @IsNotEmpty()
  termsDocumentId!: string;

  @ApiProperty({ example: 'v1.0.0', description: '약관 버전 라벨' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: '약관 본문 내용(마크다운 등)...', description: '약관 본문' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: '효력 시각' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveAt?: Date;

  @ApiPropertyOptional({ example: 'DRAFT', enum: ['DRAFT', 'PUBLISHED'], description: '버전 상태' })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: string;
}

export class UpdateTermsVersionDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7095', description: '약관 버전 식별자' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'v1.0.1', description: '약관 버전 라벨' })
  @IsString()
  label!: string;

  @ApiProperty({ example: '약관 본문 내용(마크다운 등)...', description: '약관 본문' })
  @IsString()
  content!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: '효력 시각' })
  @Type(() => Date)
  @IsDate()
  effectiveAt!: Date;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED'], description: '버전 상태' })
  @IsIn(['DRAFT', 'PUBLISHED'])
  status!: string;
}

export class AgreeTermsDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7090', description: '매니저 식별자' })
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', description: '동의할 약관 버전 식별자' })
  @IsString()
  @IsNotEmpty()
  termsVersionId!: string;
}
