import { ApiProperty } from '@nestjs/swagger';
import { Member, MemberStatus } from '@pkg/database';
import { IsEnum, IsUUID } from 'class-validator';

import type { EntityRequestDto } from '@/common/interfaces';

export class UpdateMemberStatusRequestDto implements EntityRequestDto<Member> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '멤버 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ enum: MemberStatus, example: MemberStatus.INACTIVE, description: '변경할 상태' })
  @IsEnum(MemberStatus)
  status!: MemberStatus;
}
