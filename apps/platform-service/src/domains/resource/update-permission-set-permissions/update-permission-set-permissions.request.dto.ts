import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsOptional, IsUUID, Matches } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

const PERMISSION_CODE_PATTERN = /^[A-Z_]+:(CREATE|READ|UPDATE|DELETE)$/;

export class UpdatePermissionSetPermissionsRequestDto extends EntityRequestType(OrganizationRole) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', type: String, description: '권한 세트 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiPropertyOptional({ type: String, isArray: true, example: ['RESOURCE:READ', 'RESOURCE:UPDATE'], description: '권한 코드 목록' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => String)
  @Matches(PERMISSION_CODE_PATTERN, { each: true })
  permissionCodes?: string[];
}
