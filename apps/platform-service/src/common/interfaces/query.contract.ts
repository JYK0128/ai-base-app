import type { Type } from '@nestjs/common';

import type { QueryCursorRequest } from './query/query-cursor.request';
import type { QueryCursorResponse } from './query/query-cursor.response';
import type { QueryEntityResponse } from './query/query-entity.response';
import type { QueryListRequest } from './query/query-list.request';
import type { QueryListResponse } from './query/query-list.response';
import type { QueryPageRequest } from './query/query-page.request';
import type { QueryPageResponse } from './query/query-page.response';
import type { QuerySortPairRequest } from './query/query-sort-pair.request';

export interface IQueryHandler<TEntity extends Type> {
  /** 페이지 조회 */
  page(query: QueryPageRequest<TEntity>): Promise<QueryPageResponse<TEntity>>
  /** 커서 조회 */
  cursor(query: QueryCursorRequest<TEntity>): Promise<QueryCursorResponse<TEntity>>
  /** 리스트 조회 */
  list(query: QueryListRequest<TEntity>): Promise<QueryListResponse<TEntity>>
  /** 전체 조회 */
  read(query: QuerySortPairRequest<TEntity>): Promise<QueryListResponse<TEntity>>
  /** 단일 조회 */
  readOne(query: QuerySortPairRequest<TEntity>): Promise<QueryEntityResponse<TEntity>>
}
