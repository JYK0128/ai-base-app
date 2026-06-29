import { Query } from '@nestjs/cqrs';

import type { MeResponseDto } from './me.response.dto';

export class MeContract extends Query<MeResponseDto> {
  constructor() {
    super();
  }
}
