import { Query } from '@nestjs/cqrs';

import type { PageRequestDto } from '../request/page.request.dto';
import type { PageResponseDto } from '../response/page.response.dto';

export abstract class PageQuery<TEntity extends object> extends Query<PageResponseDto<TEntity>> {
  constructor(public readonly query: PageRequestDto<TEntity>) {
    super();
  }
}
