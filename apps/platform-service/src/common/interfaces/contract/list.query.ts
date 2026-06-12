import type { Type } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import type { ListRequestDto } from '../request/list.request.dto';
import type { ListResponseDto } from '../response/list.response.dto';

export abstract class ListQuery<TEntity extends Type> extends Query<ListResponseDto<TEntity>> {
  constructor(public readonly query: ListRequestDto<TEntity>) {
    super();
  }
}
