import type { FilterRequestDto } from './filter.request.dto';
import type { SortPairRequestDto } from './sort-pair.request.dto';

export type PageRequestDto<TEntity extends object> = {}
  & SortPairRequestDto<TEntity>
  & FilterRequestDto<TEntity>
  & {
    page: number
    limit: number
  };
