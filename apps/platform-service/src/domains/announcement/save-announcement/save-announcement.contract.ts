import { Command } from '@nestjs/cqrs';

import type { AnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';
import type { SaveAnnouncementRequestDto } from './save-announcement.request.dto';

export class SaveAnnouncementContract extends Command<AnnouncementResponseDto> {
  constructor(public readonly data: SaveAnnouncementRequestDto) {
    super();
  }
}
