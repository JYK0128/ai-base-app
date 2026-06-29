import { ApiProperty } from '@nestjs/swagger';
import { Member } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

export class UpdateMemberRoleRequestDto extends EntityRequestType(Member) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '멤버 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7091', description: '변경할 역할' })
  @Type(() => String)
  @IsUUID()
  role!: string;
}
