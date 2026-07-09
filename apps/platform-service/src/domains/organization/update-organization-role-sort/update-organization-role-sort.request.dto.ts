import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

class UpdateOrganizationRoleSortItemDto extends EntityRequestType(OrganizationRole) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', type: String, description: '조직 역할 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiProperty({ example: 1, type: Number, description: '정렬 순서' })
  @Type(() => Number)
  @IsInt()
  override sortOrder!: number;
}

export class UpdateOrganizationRoleSortRequestDto extends EntityRequestType(OrganizationRole) {
  @ApiProperty({ example: [{ id: '019e5236-adae-70d7-a8f7-2dc90bdf7102', sortOrder: 1 }], type: () => [UpdateOrganizationRoleSortItemDto], description: '정렬 대상 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrganizationRoleSortItemDto)
  items!: UpdateOrganizationRoleSortItemDto[];
}
