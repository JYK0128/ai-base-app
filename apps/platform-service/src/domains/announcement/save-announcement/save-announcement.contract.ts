import { Command } from '@nestjs/cqrs';

import type { CreateAnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';
import type { CreateAnnouncementRequestDto } from './save-announcement.request.dto';

export class CreateAnnouncementContract extends Command<CreateAnnouncementResponseDto> {
  constructor(public readonly data: CreateAnnouncementRequestDto) {
    super();
  }
}
