import { Query } from '@nestjs/cqrs';

import type { GetLocalesResponseDto } from './get-locales.response.dto';

export class GetLocalesContract extends Query<GetLocalesResponseDto> {
  constructor() {
    super();
  }
}
