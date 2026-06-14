import type { FilterRequestDto } from './filter.request.dto';
import type { SortPairRequestDto } from './sort-pair.request.dto';

export type CursorRequestDto<TEntity extends object> = {}
  & SortPairRequestDto<TEntity>
  & FilterRequestDto<TEntity>
  & {
    cursor?: string
    limit: number
  };
