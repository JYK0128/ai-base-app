import { Command } from '@nestjs/cqrs';

import type { UpdateMemberRoleRequestDto } from './update-member-role.request.dto';
import type { UpdateMemberRoleResponseDto } from './update-member-role.response.dto';

export class UpdateMemberRoleContract extends Command<UpdateMemberRoleResponseDto> {
  constructor(public readonly data: UpdateMemberRoleRequestDto) {
    super();
  }
}
