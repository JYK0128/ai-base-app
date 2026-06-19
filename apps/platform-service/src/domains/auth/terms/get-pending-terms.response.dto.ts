import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument, TermsDocumentStatus, TermsVersion, TermsVersionStatus } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class GetPendingTermsDocumentResponseDto implements EntityResponseDto<TermsDocument> {
  constructor(document: TermsDocument) {
    this.id = document.id;
    this.code = document.code;
    this.title = document.title;
    this.required = document.required;
    this.terminatedAt = document.terminatedAt ?? undefined;
    this.status = document.status;
    this.organization = document.organization?.id;
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7081',
    description: '약관 문서 식별자',
  })
  id!: string;

  @ApiProperty({ example: 'privacy', description: '약관 코드' })
  code!: string;

  @ApiProperty({ example: '개인정보 처리방침', description: '약관 제목' })
  title!: string;

  @ApiProperty({ example: true, description: '필수 동의 여부' })
  required!: boolean;

  @ApiPropertyOptional({
    example: '2026-06-06T14:00:00.000Z',
    description: '종료 일시',
  })
  terminatedAt?: Date;

  @ApiProperty({
    enum: TermsDocumentStatus,
    example: TermsDocumentStatus.PUBLISHED,
    description: '약관 상태',
  })
  status!: TermsDocumentStatus;

  @ApiPropertyOptional({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7088',
    description: '조직 식별자',
  })
  organization?: string;
}

export class GetPendingTermsVersionResponseDto implements EntityResponseDto<TermsVersion> {
  constructor(version: TermsVersion) {
    this.id = version.id;
    this.label = version.label;
    this.content = version.content;
    this.checksum = version.checksum;
    this.status = version.status;
    this.effectiveAt = version.effectiveAt ?? undefined;
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7082',
    description: '약관 버전 식별자',
  })
  id!: string;

  @ApiProperty({ example: 'v1.0.0', description: '버전 라벨' })
  label!: string;

  @ApiProperty({ example: '약관 본문 내용입니다...', description: '약관 내용' })
  content!: string;

  @ApiProperty({ example: 'sha256-checksum...', description: '체크섬' })
  checksum!: string;

  @ApiProperty({
    enum: TermsVersionStatus,
    example: TermsVersionStatus.PUBLISHED,
    description: '버전 상태',
  })
  status!: TermsVersionStatus;

  @ApiPropertyOptional({
    example: '2026-06-06T14:00:00.000Z',
    description: '효력 일시',
  })
  effectiveAt?: Date;
}

export class GetPendingTermsAgreementResponseDto {
  constructor(
    document: TermsDocument,
    currentVersion: TermsVersion,
  ) {
    this.document = new GetPendingTermsDocumentResponseDto(document);
    this.currentVersion = new GetPendingTermsVersionResponseDto(currentVersion);
  }

  @ApiProperty({
    type: () => GetPendingTermsDocumentResponseDto,
    description: '약관 문서 정보',
  })
  document!: GetPendingTermsDocumentResponseDto;

  @ApiProperty({
    type: () => GetPendingTermsVersionResponseDto,
    description: '현재 효력 중인 최신 버전 정보',
  })
  currentVersion!: GetPendingTermsVersionResponseDto;
}
