import { Query } from '@nestjs/cqrs';

import type { GetMembersRequestDto } from './get-members.request.dto';
import type { GetMemberResponseDto } from './get-members.response.dto';

export class GetMembersContract extends Query<GetMemberResponseDto[]> {
  constructor(public readonly data: GetMembersRequestDto) {
    super();
  }
}
