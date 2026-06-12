import { Command } from '@nestjs/cqrs';

import type { MemberIdResponseDto } from '../member-id.response.dto';
import type { UpdateMemberRoleRequestDto } from './update-member-role.request.dto';

export class UpdateMemberRoleContract extends Command<MemberIdResponseDto> {
  constructor(public readonly data: UpdateMemberRoleRequestDto) {
    super();
  }
}
