import { Query } from '@nestjs/cqrs';

import type { GetInvitePageRequestDto } from './get-invite-page.request.dto';
import type { GetInvitePageResponseDto } from './get-invite-page.response.dto';

export class GetInvitePageContract extends Query<GetInvitePageResponseDto> {
  constructor(public readonly data: GetInvitePageRequestDto) {
    super();
  }
}
