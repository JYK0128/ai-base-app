import type { EntityResponseDto } from './entity.response.dto';

export type ListResponseDto<TEntity extends object> = {
  items: EntityResponseDto<TEntity>[]
};
