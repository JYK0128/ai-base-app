import { Query } from '@nestjs/cqrs';

import type { GetMemberPageRequestDto } from './get-member-page.request.dto';
import type { GetMemberPageResponseDto } from './get-member-page.response.dto';

export class GetMemberPageContract extends Query<GetMemberPageResponseDto> {
  constructor(public readonly data: GetMemberPageRequestDto) {
    super();
  }
}
