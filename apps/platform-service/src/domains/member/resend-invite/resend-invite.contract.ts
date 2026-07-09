import { Command } from '@nestjs/cqrs';

import type { ResendInviteRequestDto } from './resend-invite.request.dto';
import type { ResendInviteResponseDto } from './resend-invite.response.dto';

export class ResendInviteContract extends Command<ResendInviteResponseDto> {
  constructor(public readonly data: ResendInviteRequestDto) {
    super();
  }
}
