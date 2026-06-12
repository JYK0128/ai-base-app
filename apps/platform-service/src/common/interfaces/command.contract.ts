import type { Type } from '@nestjs/common';

import type { EntityRequestDto } from './request/entity.request.dto';
import type { IdRequestDto } from './request/id.request.dto';
import type { AffectedRowsResponseDto } from './response/affected-rows.response.dto';
import type { EntityResponseDto } from './response/entity.response.dto';
import type { IdResponseDto } from './response/id.response.dto';
import type { IdListResponseDto } from './response/id-list.response.dto';

export interface ICommandHandler<TEntity extends Type> {
  /** 생성 - 단일 */
  insert(data: EntityRequestDto<TEntity>): Promise<IdResponseDto<TEntity>>
  /** 생성 - 복수 */
  insertMany(data: EntityRequestDto<TEntity>[]): Promise<IdListResponseDto<TEntity>>

  /** 생성 및 갱신 - 단일 */

  upsert(data: EntityRequestDto<TEntity>): Promise<EntityResponseDto<TEntity>>
  /** 생성 및 갱신 - 복수 */
  upsertMany(data: EntityRequestDto<TEntity>[]): Promise<EntityResponseDto<TEntity>[]>

  /** 갱신 */
  update(condition: IdRequestDto<TEntity>, data: EntityRequestDto<TEntity>): Promise<AffectedRowsResponseDto<TEntity>>

  /** 삭제 */
  delete(condition: IdRequestDto<TEntity>): Promise<AffectedRowsResponseDto<TEntity>>
}
