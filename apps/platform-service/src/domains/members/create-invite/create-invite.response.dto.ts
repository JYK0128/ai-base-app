import { ApiProperty } from '@nestjs/swagger';
import { MemberInvite } from '@pkg/database';

import type { IdResponseDto } from '@/common/interfaces';

export class CreateInviteResponseDto implements IdResponseDto<MemberInvite> {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '초대 식별자' })
  id!: string;
}
