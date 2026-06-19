import { Command } from '@nestjs/cqrs';

import type { EntityRequestDto } from '../request/entity.request.dto';
import type { IdListResponseDto } from '../response/id-list.response.dto';

export abstract class InsertManyCommand<TEntity extends object> extends Command<IdListResponseDto<TEntity>> {
  constructor(public readonly data: EntityRequestDto<TEntity>[]) {
    super();
  }
}
