import type { QueryCursorRequest, QueryListRequest, QueryPageRequest, QuerySortRequest } from './query.request.interface';
import type { QueryCursorResponse, QueryDataResponse, QueryPageResponse } from './query.response.interface';

export interface QueryInterface<
  ENTITY extends object,
> {
  /** 페이지 조회 */
  page(query: QueryPageRequest<ENTITY>): Promise<QueryPageResponse<ENTITY>>
  /** 커서 조회 */
  cursor(query: QueryCursorRequest<ENTITY>): Promise<QueryCursorResponse<ENTITY>>
  /** 리스트 조회 */
  list(query: QueryListRequest<ENTITY>): Promise<QueryDataResponse<ENTITY>>
  /** 전체 조회 */
  read(query: QuerySortRequest<ENTITY>): Promise<QueryDataResponse<ENTITY>[]>
  /** 단일 조회 */
  readOne(query: QuerySortRequest<ENTITY>): Promise<QueryDataResponse<ENTITY>>
}
