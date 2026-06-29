import { Query } from '@nestjs/cqrs';

import type { PendingTermListResponseDto } from './pending-term-list.response.dto';

export class PendingTermListContract extends Query<PendingTermListResponseDto> {
  constructor() {
    super();
  }
}
