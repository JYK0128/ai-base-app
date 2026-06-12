import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withQuerySort } from './sort.dto';

export function withQueryCursor<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withQuerySort(Base) {
    [key: string]: unknown

    @ApiPropertyOptional({
      description: '이전 페이지 커서',
    })
    cursor?: string;

    @ApiPropertyOptional({
      description: '페이지 크기',
      minimum: 1,
      example: 20,
    })
    limit?: number;
  }

  return MixinClass;
}

export type QueryCursorRequest<TBase extends Type>
  = Partial<InstanceType<TBase>> & InstanceType<ReturnType<typeof withQueryCursor<TBase>>>;
