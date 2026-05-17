import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'New Feature Released' })
  title!: string;

  @ApiProperty({ example: 'We are excited to announce...' })
  content!: string;

  @ApiPropertyOptional({ example: true })
  isPublished?: boolean;
}

export class GetOrganizationsQueryDto {
  @ApiPropertyOptional({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DORMANT'] })
  status?: string;
}

export class GetAnnouncementsQueryDto {
  @ApiPropertyOptional({ example: false })
  isPublishedOnly?: boolean;
}

export class GetTicketsQueryDto {
  @ApiPropertyOptional({ example: 'org_123' })
  organizationId?: string;

  @ApiPropertyOptional({ example: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  status?: string;
}

export class GetTermsQueryDto {
  @ApiPropertyOptional({ example: 'org_123', description: '조직별 약관 조회 시 조직 ID (미입력 시 플랫폼 공통 약관 포함 조회)' })
  organizationId?: string;
}

export class CreateTermsDocumentDto {
  @ApiProperty({ example: 'SERVICE_TOS' })
  code!: string;

  @ApiProperty({ example: '서비스 이용약관' })
  title!: string;

  @ApiPropertyOptional({ example: true })
  required?: boolean;

  @ApiPropertyOptional({ example: 'org_123', description: '조직 전용 약관일 경우 조직 ID (미입력 시 플랫폼 공통 약관)' })
  organizationId?: string;
}

export class CreateTermsVersionDto {
  @ApiProperty({ example: 'terms_doc_123' })
  termsDocumentId!: string;

  @ApiProperty({ example: 'v1.0.0' })
  label!: string;

  @ApiProperty({ example: '약관 본문 내용 (Markdown 등)...' })
  content!: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: '효력 발생일 (미입력 시 현재 시간)' })
  effectiveFrom?: Date;

  @ApiPropertyOptional({ example: '9999-12-31T23:59:59Z', description: '효력 종료일 (미입력 시 무제한)' })
  effectiveTo?: Date;

  @ApiPropertyOptional({ example: 'DRAFT', enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED'], description: '약관 버전 상태 (미입력 시 DRAFT)' })
  status?: string;
}

export class AgreeTermsDto {
  @ApiProperty({ example: 'manager_123' })
  managerId!: string;

  @ApiProperty({ example: 'terms_ver_123' })
  termsVersionId!: string;

  @ApiPropertyOptional({ example: 'org_123' })
  organizationId?: string;

  @ApiPropertyOptional({ example: 'WEB' })
  source?: string;

  @ApiPropertyOptional({ example: '127.0.0.1' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0' })
  userAgent?: string;
}
