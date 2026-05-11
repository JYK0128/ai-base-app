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
