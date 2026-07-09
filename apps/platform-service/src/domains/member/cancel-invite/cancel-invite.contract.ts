import { Command } from '@nestjs/cqrs';

import type { CancelInviteRequestDto } from './cancel-invite.request.dto';
import type { CancelInviteResponseDto } from './cancel-invite.response.dto';

export class CancelInviteContract extends Command<CancelInviteResponseDto> {
  constructor(public readonly data: CancelInviteRequestDto) {
    super();
  }
}
