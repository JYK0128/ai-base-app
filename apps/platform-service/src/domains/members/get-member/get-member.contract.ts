import { Query } from '@nestjs/cqrs';

import type { GetMemberRequestDto } from './get-member.request.dto';
import type { GetMemberResponseDto } from './get-member.response.dto';

export class GetMemberContract extends Query<GetMemberResponseDto> {
  constructor(public readonly data: GetMemberRequestDto) {
    super();
  }
}
