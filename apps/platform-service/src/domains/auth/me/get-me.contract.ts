import { Query } from '@nestjs/cqrs';

import type { GetMeResponseDto } from './get-me.response.dto';

export class GetMeContract extends Query<GetMeResponseDto> {
  constructor() {
    super();
  }
}
