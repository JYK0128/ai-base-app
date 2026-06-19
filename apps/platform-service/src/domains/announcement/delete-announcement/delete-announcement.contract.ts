import { Command } from '@nestjs/cqrs';

import type { DeleteAnnouncementRequestDto } from './delete-announcement.request.dto';
import type { DeleteAnnouncementResponseDto } from './delete-announcement.response.dto';

export class DeleteAnnouncementContract extends Command<DeleteAnnouncementResponseDto> {
  constructor(public readonly data: DeleteAnnouncementRequestDto) {
    super();
  }
}
