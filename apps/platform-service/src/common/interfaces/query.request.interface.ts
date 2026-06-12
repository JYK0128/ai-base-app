import type { DtoInterface } from './dto.interface';

export type SortDirection = 'asc' | 'desc';

export type QuerySortRequest<T extends object> = DtoInterface<T> & {
  sortBy?: string
  sortDirection?: SortDirection
};

export type QueryPageRequest<T extends object> = QuerySortRequest<T> & {
  page?: number
  limit?: number
};

export type QueryCursorRequest<T extends object> = QuerySortRequest<T> & {
  cursor?: string
  limit?: number
};

export type QueryListRequest<T extends object> = QuerySortRequest<T> & {
  offset?: number
  limit?: number
};
