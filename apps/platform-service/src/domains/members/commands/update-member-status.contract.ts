import { Command } from '@nestjs/cqrs';

import type { UpdateMemberStatusRequestDto } from './update-member-status.request.dto';
import type { MemberIdResponseDto } from './update-member-status.response.dto';

export class UpdateMemberStatusContract extends Command<MemberIdResponseDto> {
  constructor(public readonly data: UpdateMemberStatusRequestDto) {
    super();
  }
}
