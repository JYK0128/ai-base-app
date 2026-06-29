import { Query } from '@nestjs/cqrs';

import type { GetInviteListRequestDto } from './get-invite-list.request.dto';
import type { GetInviteListResponseDto } from './get-invite-list.response.dto';

export class GetInviteListContract extends Query<GetInviteListResponseDto> {
  constructor(public readonly data: GetInviteListRequestDto) {
    super();
  }
}
