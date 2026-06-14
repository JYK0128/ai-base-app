import { Query } from '@nestjs/cqrs';

import type { GetAnnouncementsRequestDto } from './get-announcements.request.dto';
import type { GetAnnouncementResponseDto } from './get-announcements.response.dto';

export class GetAnnouncementsContract extends Query<GetAnnouncementResponseDto[]> {
  constructor(public readonly data: GetAnnouncementsRequestDto) {
    super();
  }
}
