import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TermsDocumentResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7094', description: '약관 문서 식별자' })
  id!: string;

  @ApiPropertyOptional({
    type: String,
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7088',
    nullable: true,
    description: '조직 식별자',
  })
  organizationId?: string | null;

  @ApiProperty({ example: 'SERVICE_TOS', description: '약관 문서 코드' })
  code!: string;

  @ApiProperty({ example: '서비스 이용약관', description: '약관 제목' })
  title!: string;

  @ApiProperty({ example: true, description: '필수 약관 여부' })
  required!: boolean;

  @ApiPropertyOptional({ type: String, example: '2026-06-20T00:00:00.000Z', nullable: true, description: '폐기 시점' })
  deprecatedAt?: string | null;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED'], description: '문서 상태' })
  status!: string;
}

export class TermsVersionResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7095', description: '약관 버전 식별자' })
  id!: string;

  @ApiProperty({ example: 'v1.0.0', description: '버전 라벨' })
  versionLabel!: string;

  @ApiProperty({ example: '약관 본문 내용...', description: '약관 본문' })
  content!: string;

  @ApiProperty({ example: 'sha256:deadbeef...', description: '체크섬' })
  checksum!: string;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED'], description: '버전 상태' })
  status!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: '효력 시각' })
  effectiveAt!: string;
}

export class TermsDocumentDetailResponseDto {
  @ApiProperty({ type: TermsDocumentResponseDto, description: '문서 기본 정보' })
  document!: TermsDocumentResponseDto;

  @ApiProperty({ type: [TermsVersionResponseDto], description: '버전 목록' })
  versions!: TermsVersionResponseDto[];

  @ApiPropertyOptional({ type: TermsVersionResponseDto, nullable: true, description: '현재 효력 중인 버전' })
  currentVersion?: TermsVersionResponseDto | null;
}

export class MemberTermsConsentResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7096', description: '동의 이력 식별자' })
  id!: string;

  @ApiProperty({ example: true, description: '동의 여부' })
  agreed!: boolean;

  @ApiProperty({ example: '2026-05-11T00:00:00Z', description: '동의 일시' })
  agreedAt!: string;
}
