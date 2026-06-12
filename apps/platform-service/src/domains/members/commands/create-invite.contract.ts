import { Command } from '@nestjs/cqrs';

import type { CreateInviteRequestDto } from './create-invite.request.dto';
import type { CreateInviteResponseDto } from './create-invite.response.dto';

export class CreateInviteContract extends Command<CreateInviteResponseDto> {
  constructor(public readonly data: CreateInviteRequestDto) {
    super();
  }
}
