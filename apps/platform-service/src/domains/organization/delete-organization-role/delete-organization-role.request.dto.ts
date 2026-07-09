import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

export class DeleteOrganizationRoleRequestDto extends EntityRequestType(OrganizationRole) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', type: String, description: '조직 역할 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;
}
