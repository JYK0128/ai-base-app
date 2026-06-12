import { Command } from '@nestjs/cqrs';

import type { UpdateMemberRoleRequestDto } from './update-member-role.request.dto';
import type { MemberIdResponseDto } from './update-member-status.response.dto';

export class UpdateMemberRoleContract extends Command<MemberIdResponseDto> {
  constructor(public readonly data: UpdateMemberRoleRequestDto) {
    super();
  }
}
