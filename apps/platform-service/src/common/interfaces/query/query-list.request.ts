import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withQuerySortPairRequest } from './query-sort-pair.request';

export function withQueryListRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withQuerySortPairRequest(Base) {
    @ApiPropertyOptional({
      description: '오프셋',
      minimum: 0,
      example: 0,
      default: 0,
    })
    offset: number = 0;

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

export type QueryListRequest<TEntity extends Type>
  = InstanceType<ReturnType<typeof withQueryListRequest<TEntity>>>;
