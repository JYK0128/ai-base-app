import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({ example: 'org_123' })
  id: string;

  @ApiProperty({ example: 'Awesome Corp' })
  name: string;

  @ApiProperty({ example: 'awesome' })
  subdomain: string;

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DORMANT'] })
  status: string;

  @ApiProperty({ example: '2024-05-10T00:00:00Z' })
  createdAt: string;
}

export class AnnouncementResponseDto {
  @ApiProperty({ example: 'ann_123' })
  id: string;

  @ApiProperty({ example: 'New Feature Released' })
  title: string;

  @ApiProperty({ example: 'We are excited to announce...' })
  content: string;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty({ example: '2024-05-10T00:00:00Z' })
  createdAt: string;
}

export class TicketResponseDto {
  @ApiProperty({ example: 'tick_123' })
  id: string;

  @ApiProperty({ example: 'org_123' })
  organizationId: string;

  @ApiProperty({ example: 'Login Issue' })
  title: string;

  @ApiProperty({ example: 'I cannot login to my account...' })
  content: string;

  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  status: string;

  @ApiProperty({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  priority: string;

  @ApiProperty({ example: '2024-05-10T00:00:00Z' })
  createdAt: string;
}

export class TermsDocumentResponseDto {
  @ApiProperty({ example: 'terms_doc_123' })
  id: string;

  @ApiProperty({ example: 'org_123', nullable: true })
  organizationId: string | null;

  @ApiProperty({ example: 'SERVICE_TOS' })
  code: string;

  @ApiProperty({ example: '서비스 이용약관' })
  title: string;

  @ApiProperty({ example: true })
  required: boolean;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED'] })
  status: string;
}

export class TermsVersionResponseDto {
  @ApiProperty({ example: 'terms_ver_123' })
  id: string;

  @ApiProperty({ example: 'v1.0.0' })
  versionLabel: string;

  @ApiProperty({ example: '약관 본문 내용...' })
  content: string;

  @ApiProperty({ example: 'PUBLISHED', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  status: string;
}

export class ManagerTermsConsentResponseDto {
  @ApiProperty({ example: 'consent_123' })
  id: string;

  @ApiProperty({ example: true })
  agreed: boolean;

  @ApiProperty({ example: '2026-05-11T00:00:00Z' })
  agreedAt: string;
}
