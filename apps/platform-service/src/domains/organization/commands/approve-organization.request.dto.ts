import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from '@pkg/database';
import { IsBoolean } from 'class-validator';

import type { EntityRequestDto } from '@/common/interfaces';

export class UpdateOrganizationApprovalRequestDto implements EntityRequestDto<Organization> {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '조직 식별자' })
  id?: string;

  @ApiProperty({ example: true, description: '승인 여부' })
  @IsBoolean()
  approve!: boolean;
}
