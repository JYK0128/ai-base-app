import { Command } from '@nestjs/cqrs';

import type { AuthLoginRequestDto } from './login.request.dto';
import type { AuthLoginResponseDto } from './login.response.dto';

export class AuthLoginContract extends Command<AuthLoginResponseDto> {
  constructor(public readonly data: AuthLoginRequestDto) {
    super();
  }
}
