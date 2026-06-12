import type { Type } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import type { EntityRequestDto } from '../request/entity.request.dto';
import type { EntityResponseDto } from '../response/entity.response.dto';

export abstract class UpsertManyCommand<TEntity extends Type> extends Command<EntityResponseDto<TEntity>[]> {
  constructor(public readonly data: EntityRequestDto<TEntity>[]) {
    super();
  }
}
