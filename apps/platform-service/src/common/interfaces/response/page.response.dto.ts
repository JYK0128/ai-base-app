import type { EntityResponseDto } from './entity.response.dto';

export type PageResponseDto<TEntity extends object>
  = object
    & {
      items: EntityResponseDto<TEntity>[]
      totalCount: number
      page: number
      limit: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    };
