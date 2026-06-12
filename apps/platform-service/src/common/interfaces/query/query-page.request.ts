import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withQuerySortPairRequest } from './query-sort-pair.request';

export function withQueryPageRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withQuerySortPairRequest(Base) {
    @ApiPropertyOptional({
      description: '페이지 번호',
      minimum: 1,
      example: 1,
      default: 1,
    })
    page: number = 1;

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

export type QueryPageRequest<TEntity extends Type>
  = InstanceType<ReturnType<typeof withQueryPageRequest<TEntity>>>;
