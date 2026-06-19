import { Command } from '@nestjs/cqrs';

import type { AuthDeferPasswordChangeResponseDto } from './defer-password-change.response.dto';

export class AuthDeferPasswordChangeContract extends Command<AuthDeferPasswordChangeResponseDto> {}
