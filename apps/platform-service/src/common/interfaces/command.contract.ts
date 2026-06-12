import type { Type } from '@nestjs/common';

import type { CommandAffectedRowsResponse } from './command/command-affected-rows.response';
import type { CommandEntityRequest } from './command/command-entity.request';
import type { CommandEntityResponse } from './command/command-entity.response';
import type { CommandIdRequest } from './command/command-id.request';
import type { CommandIdResponse } from './command/command-id.response';
import type { CommandIdListResponse } from './command/command-id-list.response';

export interface ICommandHandler<TEntity extends Type> {
  /** 생성 - 단일 */
  insert(data: CommandEntityRequest<TEntity>): Promise<CommandIdResponse<TEntity>>
  /** 생성 - 복수 */
  insertMany(data: CommandEntityRequest<TEntity>[]): Promise<CommandIdListResponse<TEntity>>

  /** 생성 및 갱신 - 단일 */

  upsert(data: CommandEntityRequest<TEntity>): Promise<CommandEntityResponse<TEntity>>
  /** 생성 및 갱신 - 복수 */
  upsertMany(data: CommandEntityRequest<TEntity>[]): Promise<CommandEntityResponse<TEntity>[]>

  /** 갱신 */
  update(condition: CommandIdRequest<TEntity>, data: CommandEntityRequest<TEntity>): Promise<CommandAffectedRowsResponse<TEntity>>

  /** 삭제 */
  delete(condition: CommandIdRequest<TEntity>): Promise<CommandAffectedRowsResponse<TEntity>>
}
