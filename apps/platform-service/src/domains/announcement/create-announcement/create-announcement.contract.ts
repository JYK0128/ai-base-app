import { Command } from '@nestjs/cqrs';

import type { CreateAnnouncementRequestDto } from './create-announcement.request.dto';
import type { CreateAnnouncementResponseDto } from './create-announcement.response.dto';

export class CreateAnnouncementContract extends Command<CreateAnnouncementResponseDto> {
  constructor(public readonly data: CreateAnnouncementRequestDto) {
    super();
  }
}
