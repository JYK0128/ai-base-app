import { Command } from '@nestjs/cqrs';

import type { UpdateAnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';
import type { UpdateAnnouncementRequestDto } from './update-announcement.request.dto';

export class UpdateAnnouncementContract extends Command<UpdateAnnouncementResponseDto> {
  constructor(
    public readonly announcementId: string,
    public readonly data: UpdateAnnouncementRequestDto,
  ) {
    super();
  }
}
