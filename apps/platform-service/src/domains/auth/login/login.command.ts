import { Command } from '@nestjs/cqrs';

import type { LoginRequestDto } from './login.request.dto';
import type { LoginResponseDto } from './login.response.dto';

export class LoginCommand extends Command<LoginResponseDto> {
  constructor(public readonly data: LoginRequestDto) {
    super();
  }
}
