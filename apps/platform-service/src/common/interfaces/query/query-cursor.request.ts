import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withQuerySortPairRequest } from './query-sort-pair.request';

export function withQueryCursorRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withQuerySortPairRequest(Base) {
    @ApiPropertyOptional({
      description: '이전 페이지 커서',
    })
    cursor?: string;

    @ApiPropertyOptional({
      description: '페이지 크기',
      minimum: 1,
      example: 20,
      default: 20,
    })
    limit: number = 20;
  }

  return MixinClass;
}

export type QueryCursorRequest<TEntity extends Type>
  = InstanceType<ReturnType<typeof withQueryCursorRequest<TEntity>>>;
