import type { DtoInterface } from './dto.interface';

export type QueryPageResponse<T extends object> = {
  items: DtoInterface<T>[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
};

export type QueryCursorResponse<T extends object> = {
  items: DtoInterface<T>[]
  nextCursor?: string
  prevCursor?: string
  hasNextPage: boolean
  hasPrevPage: boolean
  totalCount?: number
};

export type QueryDataResponse<T extends object>
  = DtoInterface<T>[];
