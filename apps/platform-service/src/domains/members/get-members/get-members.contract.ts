import { Query } from '@nestjs/cqrs';

import type { GetMembersRequestDto } from './get-members.request.dto';
import type { GetMembersResponseDto } from './get-members.response.dto';

export class GetMembersContract extends Query<GetMembersResponseDto[]> {
  constructor(public readonly data: GetMembersRequestDto) {
    super();
  }
}
