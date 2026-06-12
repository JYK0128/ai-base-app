import { Query } from '@nestjs/cqrs';

import type { GetAnnouncementsRequestDto } from './get-announcements.request.dto';
import type { AnnouncementResponseDto } from './get-announcements.response.dto';

export class GetAnnouncementsContract extends Query<AnnouncementResponseDto[]> {
  constructor(public readonly data: GetAnnouncementsRequestDto) {
    super();
  }
}
