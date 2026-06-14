import { Command } from '@nestjs/cqrs';

import type { DeleteAnnouncementResponseDto } from '../get-announcements/get-announcements.response.dto';
import type { DeleteAnnouncementRequestDto } from './delete-announcement.request.dto';

export class DeleteAnnouncementContract extends Command<DeleteAnnouncementResponseDto> {
  constructor(public readonly data: DeleteAnnouncementRequestDto) {
    super();
  }
}
