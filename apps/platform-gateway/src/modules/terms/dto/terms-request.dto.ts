import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument, TermsVersion } from '@pkg/database';
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

export class CreateTermsDocumentDto implements Pick<TermsDocument, 'code' | 'title'>, Partial<Pick<TermsDocument, 'required'>> {
  @ApiProperty({ example: 'privacy', description: '약관 코드' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: '개인정보 처리방침', description: '약관 제목' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: true, description: '필수 동의 여부' })
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

export class CreateTermsVersionDto implements Pick<TermsVersion, 'label' | 'content'>, Partial<Pick<TermsVersion, 'effectiveAt'>> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7089', description: '약관 문서 식별자' })
  @IsString()
  @IsNotEmpty()
  termsDocumentId!: string;

  @ApiProperty({ example: 'v1.0.0', description: '약관 버전 라벨' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: '약관 본문 내용...', description: '약관 버전 본문' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z', description: '발효 시점' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  effectiveAt?: Date;

  @ApiPropertyOptional({ example: 'DRAFT', enum: ['DRAFT', 'PUBLISHED'], description: '버전 상태' })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: string;
}

export class UpdateTermsVersionDto implements Pick<TermsVersion, 'id' | 'label' | 'content' | 'effectiveAt'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7089', description: '약관 버전 식별자' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'v1.1.0', description: '약관 버전 라벨' })
  @IsString()
  label!: string;

  @ApiProperty({ example: '약관 본문 내용...', description: '약관 버전 본문' })
  @IsString()
  content!: string;

  @ApiProperty({ example: '2026-06-15T00:00:00.000Z', description: '발효 시점' })
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
