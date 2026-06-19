import { Query } from '@nestjs/cqrs';

import type { CursorRequestDto } from '../request/cursor.request.dto';
import type { CursorResponseDto } from '../response/cursor.response.dto';

export abstract class CursorQuery<TEntity extends object> extends Query<CursorResponseDto<TEntity>> {
  constructor(public readonly query: CursorRequestDto<TEntity>) {
    super();
  }
}
