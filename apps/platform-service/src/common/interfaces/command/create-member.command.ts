import { Command } from '@nestjs/cqrs';
import { Member } from '@pkg/database';

import { withCommandEntityRequest } from './command-entity.request';
import { withCommandIdResponse } from './command-id.response';

export class CreateMemberRequestDto extends withCommandEntityRequest(Member) {}

export class CreateMemberResponseDto extends withCommandIdResponse(Member) {}

export class CreateMemberCommand extends Command<CreateMemberResponseDto> {
  constructor(
    public readonly data: CreateMemberRequestDto,
  ) {
    super();
  }
}
