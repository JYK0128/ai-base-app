import { Command } from '@nestjs/cqrs';

import type { AnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';

export class DeleteAnnouncementContract extends Command<AnnouncementResponseDto> {
  constructor(public readonly data: { id: string }) {
    super();
  }
}
