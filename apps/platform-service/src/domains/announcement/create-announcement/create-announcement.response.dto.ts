import { Announcement } from '@pkg/database';

import { IdResponseDto } from '@/common/interfaces';

export class CreateAnnouncementResponseDto extends IdResponseDto<Announcement> {
  constructor(id: string) {
    super();
    this.id = id;
  }
}
