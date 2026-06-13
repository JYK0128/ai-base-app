import { Command } from '@nestjs/cqrs';

import type { ChangePasswordRequestDto } from './change-password.request.dto';
import type { ChangePasswordResponseDto } from './change-password.response.dto';

export class ChangePasswordContract extends Command<ChangePasswordResponseDto> {
  constructor(
    public readonly data: {
      accountId: string
    } & ChangePasswordRequestDto,
  ) {
    super();
  }
}
