import type { Type } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import type { SortPairRequestDto } from '../request/sort-pair.request.dto';
import type { EntityResponseDto } from '../response/entity.response.dto';

export abstract class ReadOneQuery<TEntity extends Type> extends Query<EntityResponseDto<TEntity>> {
  constructor(public readonly query: SortPairRequestDto<TEntity>) {
    super();
  }
}
