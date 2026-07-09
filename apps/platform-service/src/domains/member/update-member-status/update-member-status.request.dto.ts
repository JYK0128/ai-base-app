import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Member, MemberStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { EntityRequestType } from '@/common/interfaces';

export class UpdateMemberStatusRequestDto extends EntityRequestType(Member) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', type: String, description: '멤버 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiPropertyOptional({ example: MemberStatus.INACTIVE, enum: MemberStatus, description: '변경할 상태' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(MemberStatus)
  override status?: MemberStatus;
}
