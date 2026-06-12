import { Command } from '@nestjs/cqrs';

import type { DeferPasswordChangeRequestDto } from './defer-password-change.request.dto';
import type { DeferPasswordChangeResponseDto } from './defer-password-change.response.dto';

export class DeferPasswordChangeContract extends Command<DeferPasswordChangeResponseDto> {
  constructor(public readonly data: DeferPasswordChangeRequestDto) {
    super();
  }
}
