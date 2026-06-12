import { Command } from '@nestjs/cqrs';

import type { UpdateMemberStatusRequestDto } from './update-member-status.request.dto';
import type { UpdateMemberStatusResponseDto } from './update-member-status.response.dto';

export class UpdateMemberStatusContract extends Command<UpdateMemberStatusResponseDto> {
  constructor(public readonly data: UpdateMemberStatusRequestDto) {
    super();
  }
}
