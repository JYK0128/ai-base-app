import { Query } from '@nestjs/cqrs';

import type { VerifyJoinRequestDto } from './verify-join.request.dto';
import type { VerifyJoinResponseDto } from './verify-join.response.dto';

export class VerifyJoinContract extends Query<VerifyJoinResponseDto> {
  constructor(public readonly data: VerifyJoinRequestDto) {
    super();
  }
}
