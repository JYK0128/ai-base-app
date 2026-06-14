import { Command } from '@nestjs/cqrs';

import type { AuthChangePasswordRequestDto } from './change-password.request.dto';
import type { AuthChangePasswordResponseDto } from './change-password.response.dto';

export class AuthChangePasswordContract extends Command<AuthChangePasswordResponseDto> {
  constructor(public readonly data: AuthChangePasswordRequestDto) {
    super();
  }
}
