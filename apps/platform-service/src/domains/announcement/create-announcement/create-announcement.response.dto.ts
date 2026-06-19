import { ApiProperty } from '@nestjs/swagger';
import { Announcement } from '@pkg/database';

import type { IdResponseDto } from '@/common/interfaces';

export class CreateAnnouncementResponseDto implements IdResponseDto<Announcement> {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7080', description: '공지사항 식별자' })
  id!: string;
}
