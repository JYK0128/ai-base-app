import type { EntityData } from '@mikro-orm/core';
import type { Type } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export function withQuerySort<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {
    @ApiPropertyOptional({
      description: '정렬 필드 목록',
      isArray: true,
      default: ['id'],
    })
    sort: Array<Extract<keyof EntityData<InstanceType<TBase>>, string>> = ['id' as Extract<keyof EntityData<InstanceType<TBase>>, string>];

    @ApiPropertyOptional({
      description: '정렬 방향 목록',
      enum: SortDirection,
      isArray: true,
      default: [SortDirection.DESC],
    })
    direction: SortDirection[] = [SortDirection.DESC];
  }

  return MixinClass;
}

export type QuerySortRequest<TEntity extends Type>
  = InstanceType<ReturnType<typeof withQuerySort<TEntity>>>;
