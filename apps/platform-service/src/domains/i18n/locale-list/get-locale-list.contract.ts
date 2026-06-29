import { Query } from '@nestjs/cqrs';

import type { GetLocaleListResponseDto } from './get-locale-list.response.dto';

export class GetLocaleListContract extends Query<GetLocaleListResponseDto> {
  constructor() {
    super();
  }
}
