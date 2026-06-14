import { Command } from '@nestjs/cqrs';

import type { AuthRefreshTokenRequestDto } from './refresh-token.request.dto';
import type { AuthRefreshTokenResponseDto } from './refresh-token.response.dto';

export class AuthRefreshTokenContract extends Command<AuthRefreshTokenResponseDto> {
  constructor(public readonly data: AuthRefreshTokenRequestDto) {
    super();
  }
}
