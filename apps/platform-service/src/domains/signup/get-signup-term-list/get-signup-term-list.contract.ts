import { Query } from '@nestjs/cqrs';

import type { GetSignupTermListResponseDto } from './get-signup-term-list.response.dto';

export class GetSignupTermListContract extends Query<GetSignupTermListResponseDto> {
  constructor() {
    super();
  }
}
