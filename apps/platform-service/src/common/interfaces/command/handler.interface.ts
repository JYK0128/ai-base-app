import type { Type } from '@nestjs/common';

import type { CommandDataRequest } from './request/data.interface';
import type { CommandAffectedRowsResponse } from './response/affected-rows.interface';
import type { CommandDataResponse } from './response/data.interface';
import type { CommandIdResponse } from './response/id.interface';
import type { CommandIdsResponse } from './response/ids.interface';

export interface ICommandHandler<TEntity extends Type> {
  /** 생성 - 단일 */
  insert(data: CommandDataRequest<TEntity>): Promise<CommandIdResponse>
  /** 생성 - 복수 */
  insertMany(data: CommandDataRequest<TEntity>[]): Promise<CommandIdsResponse>

  /** 생성 및 갱신 - 단일 */
  upsert(data: CommandDataRequest<TEntity>): Promise<CommandDataResponse<TEntity>>
  /** 생성 및 갱신 - 복수 */
  upsertMany(data: CommandDataRequest<TEntity>[]): Promise<CommandDataResponse<TEntity>[]>

  /** 갱신 */
  update(condition: CommandDataRequest<TEntity>, data: CommandDataRequest<TEntity>): Promise<CommandAffectedRowsResponse>

  /** 삭제 */
  delete(condition: CommandDataRequest<TEntity>): Promise<CommandAffectedRowsResponse>
}
