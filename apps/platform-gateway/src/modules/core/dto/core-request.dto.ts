import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'New Feature Released' })
  title: string;

  @ApiProperty({ example: 'We are excited to announce...' })
  content: string;

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
  @ApiPropertyOptional({ example: 'org_123', description: 'ORGANIZATION 그룹 약관 조회 시 조직 ID' })
  organizationId?: string;
}

export class CreateTermsDocumentDto {
  @ApiProperty({ example: 'PLATFORM', enum: ['PLATFORM', 'ORGANIZATION'] })
  groupType: 'PLATFORM' | 'ORGANIZATION';

  @ApiProperty({ example: 'SERVICE_TOS' })
  code: string;

  @ApiProperty({ example: '서비스 이용약관' })
  title: string;

  @ApiPropertyOptional({ example: true })
  required?: boolean;

  @ApiPropertyOptional({ example: 'org_123' })
  organizationId?: string;
}

export class CreateTermsVersionDto {
  @ApiProperty({ example: 'terms_doc_123' })
  termsDocumentId: string;

  @ApiProperty({ example: 'v1.0.0' })
  versionLabel: string;

  @ApiProperty({ example: '약관 본문 markdown...' })
  contentMd: string;

  @ApiPropertyOptional({ example: false })
  publish?: boolean;
}

export class AgreeTermsDto {
  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ApiProperty({ example: 'terms_ver_123' })
  termsVersionId: string;

  @ApiPropertyOptional({ example: 'org_123' })
  organizationId?: string;

  @ApiPropertyOptional({ example: 'WEB' })
  source?: string;

  @ApiPropertyOptional({ example: '127.0.0.1' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0' })
  userAgent?: string;
}
