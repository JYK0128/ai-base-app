import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TermsConsent, TermsDocument, TermsDocumentStatus, TermsVersion, TermsVersionStatus } from '@pkg/database';

export class TermsDocumentResponseDto implements Pick<TermsDocument, 'id' | 'code' | 'title' | 'required' | 'deprecatedAt' | 'status'> {
  constructor(document: TermsDocument) {
    this.id = document.id;
    this.code = document.code;
    this.title = document.title;
    this.required = document.required;
    this.deprecatedAt = document.deprecatedAt;
    this.status = document.status;
    this.organizationId = document.organization ? document.organization.id : null;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7081', description: '약관 문서 식별자' })
  id!: string;

  @ApiProperty({ example: 'privacy', description: '약관 코드' })
  code!: string;

  @ApiProperty({ example: '개인정보 처리방침', description: '약관 제목' })
  title!: string;

  @ApiProperty({ example: true, description: '필수 동의 여부' })
  required!: boolean;

  @ApiPropertyOptional({ example: '2026-06-06T14:00:00.000Z', description: '폐기 일시' })
  deprecatedAt?: Date;

  @ApiProperty({ enum: TermsDocumentStatus, example: 'PUBLISHED', description: '약관 상태' })
  status!: TermsDocumentStatus;

  @ApiPropertyOptional({
    type: String,
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7088',
    nullable: true,
    description: '조직 식별자',
  })
  organizationId?: string | null;
}

export class TermsVersionResponseDto implements Pick<TermsVersion, 'id' | 'content' | 'checksum' | 'status' | 'effectiveAt'> {
  constructor(version: TermsVersion) {
    this.id = version.id;
    this.content = version.content;
    this.checksum = version.checksum;
    this.status = version.status;
    this.effectiveAt = version.effectiveAt;
    this.versionLabel = version.label;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7082', description: '약관 버전 식별자' })
  id!: string;

  @ApiProperty({ example: '약관 본문 내용입니다...', description: '약관 내용' })
  content!: string;

  @ApiProperty({ example: 'sha256-checksum...', description: '체크섬' })
  checksum!: string;

  @ApiProperty({ enum: TermsVersionStatus, example: 'PUBLISHED', description: '버전 상태' })
  status!: TermsVersionStatus;

  @ApiProperty({ example: '2026-06-06T14:00:00.000Z', description: '효력 일시' })
  effectiveAt!: Date;

  @ApiProperty({ example: 'v1.0.0', description: '버전 라벨' })
  versionLabel!: string;
}

export class TermsDocumentDetailResponseDto {
  constructor(
    document: TermsDocumentResponseDto,
    versions: TermsVersionResponseDto[],
    currentVersion?: TermsVersionResponseDto | null,
  ) {
    this.document = document;
    this.versions = versions;
    this.currentVersion = currentVersion ?? null;
  }

  @ApiProperty({ type: TermsDocumentResponseDto, description: '문서 기본 정보' })
  document!: TermsDocumentResponseDto;

  @ApiProperty({ type: [TermsVersionResponseDto], description: '버전 목록' })
  versions!: TermsVersionResponseDto[];

  @ApiPropertyOptional({ type: TermsVersionResponseDto, nullable: true, description: '현재 효력 중인 버전' })
  currentVersion?: TermsVersionResponseDto | null;
}

export class MemberTermsConsentResponseDto implements Pick<TermsConsent, 'id' | 'agreed'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7083', description: '동의 식별자' })
  id!: string;

  @ApiProperty({ example: true, description: '동의 여부' })
  agreed!: boolean;

  @ApiProperty({ example: '2026-05-11T00:00:00Z', description: '동의 일시' })
  agreedAt!: string;
}
