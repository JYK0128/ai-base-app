import { ApiProperty } from '@nestjs/swagger';
import type { Announcement } from '@pkg/database';
import { IsUUID } from 'class-validator';

import type { IdRequestDto } from '@/common/interfaces';

export class GetAnnouncementRequestDto implements IdRequestDto<Announcement> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '공지사항 식별자' })
  @IsUUID()
  id!: string;
}
