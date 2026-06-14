import type { FilterRequestDto } from './filter.request.dto';
import type { SortPairRequestDto } from './sort-pair.request.dto';

export type ListRequestDto<TEntity extends object> = {}
  & SortPairRequestDto<TEntity>
  & FilterRequestDto<TEntity>
  & {
    offset: number
    limit: number
  };
