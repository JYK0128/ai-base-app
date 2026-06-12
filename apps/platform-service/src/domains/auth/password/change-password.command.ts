import { Command } from '@nestjs/cqrs';

import type { ChangePasswordRequestDto } from './change-password.request';
import type { ChangePasswordResponseDto } from './change-password.response';

export class ChangePasswordCommand extends Command<ChangePasswordResponseDto> {
  constructor(public readonly data: ChangePasswordRequestDto) {
    super();
  }
}
