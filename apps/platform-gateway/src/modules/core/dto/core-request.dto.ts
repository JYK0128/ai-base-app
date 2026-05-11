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
