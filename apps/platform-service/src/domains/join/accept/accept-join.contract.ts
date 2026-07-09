import { Command } from '@nestjs/cqrs';

import type { AcceptJoinRequestDto } from './accept-join.request.dto';
import type { AcceptJoinResponseDto } from './accept-join.response.dto';

export class AcceptJoinContract extends Command<AcceptJoinResponseDto> {
  constructor(public readonly data: AcceptJoinRequestDto) {
    super();
  }
}
