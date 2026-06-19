import { Query } from '@nestjs/cqrs';

import type { GetAnnouncementPageRequestDto } from './get-announcement-page.request.dto';
import type { GetAnnouncementPageResponseDto } from './get-announcement-page.response.dto';

export class GetAnnouncementPageContract extends Query<GetAnnouncementPageResponseDto> {
  constructor(public readonly data: GetAnnouncementPageRequestDto) {
    super();
  }
}
