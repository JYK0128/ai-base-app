import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withQuerySort } from './sort.dto';

export function withQueryList<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withQuerySort(Base) {
    @ApiPropertyOptional({
      description: '오프셋',
      minimum: 0,
      example: 0,
    })
    offset?: number;

    @ApiPropertyOptional({
      description: '페이지 크기',
      minimum: 1,
      example: 20,
    })
    limit?: number;
  }

  return MixinClass;
}

export type QueryListRequest<TEntity extends Type>
  = ReturnType<typeof withQueryList<TEntity>>;
