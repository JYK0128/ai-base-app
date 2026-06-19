import type { EntityResponseDto } from './entity.response.dto';

export type CursorResponseDto<TEntity extends object>
  = object
    & {
      items: EntityResponseDto<TEntity>[]
      nextCursor?: string
      prevCursor?: string
      hasNextPage: boolean
      hasPrevPage: boolean
      totalCount?: number
    };
