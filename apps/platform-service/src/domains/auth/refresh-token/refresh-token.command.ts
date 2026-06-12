import { Command } from '@nestjs/cqrs';

import type { RefreshTokenRequestDto } from './refresh-token.request';
import type { RefreshTokenResponseDto } from './refresh-token.response';

export class RefreshTokenCommand extends Command<RefreshTokenResponseDto> {
  constructor(public readonly data: RefreshTokenRequestDto) {
    super();
  }
}
