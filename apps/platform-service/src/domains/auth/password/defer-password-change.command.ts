import { Command } from '@nestjs/cqrs';

import type { DeferPasswordChangeRequestDto } from './defer-password-change.request';
import type { DeferPasswordChangeResponseDto } from './defer-password-change.response';

export class DeferPasswordChangeCommand extends Command<DeferPasswordChangeResponseDto> {
  constructor(public readonly data: DeferPasswordChangeRequestDto) {
    super();
  }
}
