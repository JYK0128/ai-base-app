import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withQuerySort } from './sort.dto';

export function withQueryPage<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withQuerySort(Base) {
    @ApiPropertyOptional({
      description: '페이지 번호',
      minimum: 1,
      example: 1,
    })
    page?: number;

    @ApiPropertyOptional({
      description: '페이지 크기',
      minimum: 1,
      example: 20,
    })
    limit?: number;
  }

  return MixinClass;
}

export type QueryPageRequest<TEntity extends Type>
  = ReturnType<typeof withQueryPage<TEntity>>;
