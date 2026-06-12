import { Command } from '@nestjs/cqrs';

import type { LoginRequestDto } from './login.request';
import type { LoginResponseDto } from './login.response';

export class LoginCommand extends Command<LoginResponseDto> {
  constructor(public readonly data: LoginRequestDto) {
    super();
  }
}
