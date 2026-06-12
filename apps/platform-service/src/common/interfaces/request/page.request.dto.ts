import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { withSortPairRequestDto } from './sort-pair.request.dto';

export function withPageRequestDto<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends withSortPairRequestDto(Base) {
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

export type PageRequestDto<TEntity extends Type>
  = InstanceType<ReturnType<typeof withPageRequestDto<TEntity>>>;
