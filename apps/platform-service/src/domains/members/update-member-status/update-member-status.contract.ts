import { Command } from '@nestjs/cqrs';

import type { MemberIdResponseDto } from '../member-id.response.dto';
import type { UpdateMemberStatusRequestDto } from './update-member-status.request.dto';

export class UpdateMemberStatusContract extends Command<MemberIdResponseDto> {
  constructor(public readonly data: UpdateMemberStatusRequestDto) {
    super();
  }
}
