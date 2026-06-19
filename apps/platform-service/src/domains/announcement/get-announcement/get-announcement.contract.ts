import { Query } from '@nestjs/cqrs';

import type { GetAnnouncementRequestDto } from './get-announcement.request.dto';
import type { GetAnnouncementResponseDto } from './get-announcement.response.dto';

export class GetAnnouncementContract extends Query<GetAnnouncementResponseDto> {
  constructor(public readonly data: GetAnnouncementRequestDto) {
    super();
  }
}
