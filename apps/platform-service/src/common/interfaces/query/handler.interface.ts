import type { Type } from '@nestjs/common';

import type { QueryCursorRequest } from './request/cursor.interface';
import type { QueryListRequest } from './request/list.interface';
import type { QueryPageRequest } from './request/page.interface';
import type { QuerySortRequest } from './request/sort.interface';
import type { QueryCursorResponse } from './response/cursor.interface';
import type { QueryDataResponse } from './response/data.interface';
import type { QueryListResponse } from './response/list.interface';
import type { QueryPageResponse } from './response/page.interface';

export interface IQueryHandler<TEntity extends Type> {
  /** 페이지 조회 */
  page(query: QueryPageRequest<TEntity>): Promise<QueryPageResponse<TEntity>>
  /** 커서 조회 */
  cursor(query: QueryCursorRequest<TEntity>): Promise<QueryCursorResponse<TEntity>>
  /** 리스트 조회 */
  list(query: QueryListRequest<TEntity>): Promise<QueryListResponse<TEntity>>
  /** 전체 조회 */
  read(query: QuerySortRequest<TEntity>): Promise<QueryListResponse<TEntity>>
  /** 단일 조회 */
  readOne(query: QuerySortRequest<TEntity>): Promise<QueryDataResponse<TEntity>>
}
