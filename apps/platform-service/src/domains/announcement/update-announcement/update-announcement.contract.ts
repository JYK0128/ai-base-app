import { Command } from '@nestjs/cqrs';

import type { UpdateAnnouncementRequestDto } from './update-announcement.request.dto';
import type { UpdateAnnouncementResponseDto } from './update-announcement.response.dto';

export class UpdateAnnouncementContract extends Command<UpdateAnnouncementResponseDto> {
  constructor(public readonly data: UpdateAnnouncementRequestDto) {
    super();
  }
}
