import { Command } from '@nestjs/cqrs';

import type { RefreshTokenRequestDto } from './refresh-token.request.dto';
import type { RefreshTokenResponseDto } from './refresh-token.response.dto';

export class RefreshTokenContract extends Command<RefreshTokenResponseDto> {
  constructor(public readonly data: RefreshTokenRequestDto) {
    super();
  }
}
