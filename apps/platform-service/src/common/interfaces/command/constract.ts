import type { Type } from '@nestjs/common';

import type { CommandCreateRequest } from './request/create.dto';
import type { CommandIdRequest } from './request/id.dto';
import type { CommandUpdateRequest } from './request/update.dto';
import type { CommandAffectedRowsResponse } from './response/affected-rows.dto';
import type { CommandDataResponse } from './response/data.dto';
import type { CommandIdResponse } from './response/id.dto';
import type { CommandIdsResponse } from './response/ids.dto';

export interface ICommandHandler<TEntity extends Type> {
  /** 생성 - 단일 */
  insert(data: CommandCreateRequest<TEntity>): Promise<CommandIdResponse<TEntity>>
  /** 생성 - 복수 */
  insertMany(data: CommandCreateRequest<TEntity>[]): Promise<CommandIdsResponse<TEntity>>

  /** 생성 및 갱신 - 단일 */

  upsert(data: CommandUpdateRequest<TEntity>): Promise<CommandDataResponse<TEntity>>
  /** 생성 및 갱신 - 복수 */
  upsertMany(data: CommandUpdateRequest<TEntity>[]): Promise<CommandDataResponse<TEntity>[]>

  /** 갱신 */
  update(condition: CommandIdRequest<TEntity>, data: CommandUpdateRequest<TEntity>): Promise<CommandAffectedRowsResponse<TEntity>>

  /** 삭제 */
  delete(condition: CommandIdRequest<TEntity>): Promise<CommandAffectedRowsResponse<TEntity>>
}
