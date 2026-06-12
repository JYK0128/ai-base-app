import type { Type } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import type { SortPairRequestDto } from '../request/sort-pair.request.dto';
import type { ListResponseDto } from '../response/list.response.dto';

export abstract class ReadAllQuery<TEntity extends Type> extends Query<ListResponseDto<TEntity>> {
  constructor(public readonly query: SortPairRequestDto<TEntity>) {
    super();
  }
}
