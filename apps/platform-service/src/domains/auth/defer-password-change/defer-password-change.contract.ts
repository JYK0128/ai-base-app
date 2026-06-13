import { Command } from '@nestjs/cqrs';

import type { DeferPasswordChangeResponseDto } from './defer-password-change.response.dto';

export class DeferPasswordChangeContract extends Command<DeferPasswordChangeResponseDto> {
  constructor(
    public readonly data: {
      accountId: string
    },
  ) {
    super();
  }
}
