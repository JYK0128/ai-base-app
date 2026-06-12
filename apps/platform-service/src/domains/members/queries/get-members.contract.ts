import { Query } from '@nestjs/cqrs';

import type { MemberResponseDto } from './get-member.response.dto';
import type { GetMembersRequestDto } from './get-members.request.dto';

export class GetMembersContract extends Query<MemberResponseDto[]> {
  constructor(public readonly data: GetMembersRequestDto) {
    super();
  }
}
