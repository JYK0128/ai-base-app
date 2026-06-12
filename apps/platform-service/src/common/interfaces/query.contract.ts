import type { Type } from '@nestjs/common';

import type { CursorRequestDto } from './request/cursor.request.dto';
import type { ListRequestDto } from './request/list.request.dto';
import type { PageRequestDto } from './request/page.request.dto';
import type { SortPairRequestDto } from './request/sort-pair.request.dto';
import type { CursorResponseDto } from './response/cursor.response.dto';
import type { EntityResponseDto } from './response/entity.response.dto';
import type { ListResponseDto } from './response/list.response.dto';
import type { PageResponseDto } from './response/page.response.dto';

export interface IQueryHandler<TEntity extends Type> {
  /** 페이지 조회 */
  page(query: PageRequestDto<TEntity>): Promise<PageResponseDto<TEntity>>
  /** 커서 조회 */
  cursor(query: CursorRequestDto<TEntity>): Promise<CursorResponseDto<TEntity>>
  /** 리스트 조회 */
  list(query: ListRequestDto<TEntity>): Promise<ListResponseDto<TEntity>>
  /** 전체 조회 */
  read(query: SortPairRequestDto<TEntity>): Promise<ListResponseDto<TEntity>>
  /** 단일 조회 */
  readOne(query: SortPairRequestDto<TEntity>): Promise<EntityResponseDto<TEntity>>
}
