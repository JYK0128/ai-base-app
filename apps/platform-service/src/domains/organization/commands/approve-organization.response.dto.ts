import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '@pkg/database';

import type { IdResponseDto } from '@/common/interfaces';

export class ApproveOrganizationResponseDto implements IdResponseDto<Organization> {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '조직 식별자' })
  id!: string;
}
