import { ApiProperty } from '@nestjs/swagger';
import type { Member } from '@pkg/database';
import { IsUUID } from 'class-validator';

import type { IdRequestDto } from '@/common/interfaces';

export class GetMemberRequestDto implements IdRequestDto<Member> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '멤버 식별자' })
  @IsUUID()
  id!: string;
}
