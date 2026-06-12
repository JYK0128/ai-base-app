import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withSortPairRequestDto } from './sort-pair.request.dto';

export function withListRequestDto<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withSortPairRequestDto(Base) {
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

export type ListRequestDto<TEntity extends Type>
  = InstanceType<ReturnType<typeof withListRequestDto<TEntity>>>;
