import type { Type } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import type { EntityRequestDto } from '../request/entity.request.dto';
import type { IdResponseDto } from '../response/id.response.dto';

export abstract class InsertCommand<TEntity extends Type> extends Command<IdResponseDto<TEntity>> {
  constructor(public readonly data: EntityRequestDto<TEntity>) {
    super();
  }
}
