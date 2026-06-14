import { Query } from '@nestjs/cqrs';

import type { AuthGetMeResponseDto } from './get-me.response.dto';

export class AuthGetMeContract extends Query<AuthGetMeResponseDto> {
  constructor() {
    super();
  }
}
