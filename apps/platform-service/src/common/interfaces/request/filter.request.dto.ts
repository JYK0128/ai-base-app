import type { EntityRequestDto } from './entity.request.dto';

export type FilterRequestDto<TEntity extends object>
  = EntityRequestDto<TEntity> & {
    search?: string
  };
