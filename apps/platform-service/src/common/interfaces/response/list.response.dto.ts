import type { EntityResponseDto } from './entity.response.dto';

export type ListResponseDto<TEntity extends object>
  = object
    & {
      items: EntityResponseDto<TEntity>[]
    };
