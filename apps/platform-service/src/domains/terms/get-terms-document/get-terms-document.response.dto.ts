import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsDocument,
         TermsDocumentStatus,
         TermsVersion,
         TermsVersionStatus } from '@pkg/database';

import type { EntityResponseDto } from '@/common/interfaces';

export class GetTermsDocumentResponseDto implements EntityResponseDto<TermsDocument> {
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

export class GetTermsDocumentVersionResponseDto implements EntityResponseDto<TermsVersion> {
  constructor(version: TermsVersion) {
    this.id = version.id;
    this.content = version.content;
    this.checksum = version.checksum;
    this.status = version.status;
    this.effectiveAt = version.effectiveAt ?? undefined;
    this.label = version.label;
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7082',
    description: '약관 버전 식별자',
  })
  id!: string;

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

  @ApiProperty({ example: 'v1.0.0', description: '버전 라벨' })
  label!: string;
}

export class GetTermsDocumentDetailResponseDto {
  constructor(
    document: GetTermsDocumentResponseDto,
    versions: GetTermsDocumentVersionResponseDto[],
    currentVersion?: GetTermsDocumentVersionResponseDto | null,
  ) {
    this.document = document;
    this.versions = versions;
    this.currentVersion = currentVersion ?? null;
  }

  @ApiProperty({
    type: GetTermsDocumentResponseDto,
    example: {
      id: '019e5236-adae-70d7-a8f7-2dc90bdf7081',
      code: 'privacy',
      title: '개인정보 처리방침',
      required: true,
      status: TermsDocumentStatus.PUBLISHED,
    },
    description: '문서 기본 정보',
  })
  document!: GetTermsDocumentResponseDto;

  @ApiProperty({
    type: [GetTermsDocumentVersionResponseDto],
    example: [],
    description: '버전 목록',
  })
  versions!: GetTermsDocumentVersionResponseDto[];

  @ApiPropertyOptional({
    type: GetTermsDocumentVersionResponseDto,
    example: null,
    nullable: true,
    description: '현재 효력 중인 버전',
  })
  currentVersion?: GetTermsDocumentVersionResponseDto | null;
}
