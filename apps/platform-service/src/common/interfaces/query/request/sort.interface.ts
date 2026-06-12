import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export function withQuerySort<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends Base {
    [key: string]: unknown

    @ApiPropertyOptional({ description: '정렬 기준 필드명' })
    sortBy?: string;

    @ApiPropertyOptional({ description: '정렬 방향', enum: SortDirection })
    sortDirection?: SortDirection;
  }

  return MixinClass;
}

export type QuerySortRequest<TBase extends Type>
  = InstanceType<ReturnType<typeof withQuerySort<TBase>>>;
