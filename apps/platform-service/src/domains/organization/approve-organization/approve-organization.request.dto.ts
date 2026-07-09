import { ApiProperty } from '@nestjs/swagger';
import { Organization } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsBoolean, IsUUID } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

export class ApproveOrganizationRequestDto extends EntityRequestType(Organization) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', type: String, description: '조직 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiProperty({ example: true, type: Boolean, description: '승인 여부' })
  @Type(() => Boolean)
  @IsBoolean()
  approve!: boolean;
}
