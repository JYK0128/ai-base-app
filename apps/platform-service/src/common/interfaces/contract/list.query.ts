import { Query } from '@nestjs/cqrs';

import type { ListRequestDto } from '../request/list.request.dto';
import type { ListResponseDto } from '../response/list.response.dto';

export abstract class ListQuery<TEntity extends object> extends Query<ListResponseDto<TEntity>> {
  constructor(public readonly query: ListRequestDto<TEntity>) {
    super();
  }
}
