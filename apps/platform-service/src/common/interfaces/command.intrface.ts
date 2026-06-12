import type { CommandDataRequest, CommandRequest } from './command.request.interface';
import type { CommandAffectedRowsResponse,
              CommandDataResponse, CommandIdResponse,
              CommandIdsResponse } from './command.response.interface';

export interface CommandInterface<
  ENTITY extends object,
> {
  /** 생성 - 단일 */
  insert(data: CommandDataRequest<ENTITY>): Promise<CommandIdResponse<ENTITY>>
  /** 생성 - 복수 */
  insertMany(data: CommandDataRequest<ENTITY>[]): Promise<CommandIdsResponse<ENTITY>>

  /** 생성 및 갱신 - 단일 */
  upsert(data: CommandRequest<ENTITY>): Promise<CommandDataResponse<ENTITY>>
  /** 생성 및 갱신 - 복수 */
  upsertMany(data: CommandRequest<ENTITY>[]): Promise<CommandDataResponse<ENTITY>[]>

  /** 갱신 */
  update(condition: CommandRequest<ENTITY>, data: CommandDataRequest<ENTITY>): Promise<CommandAffectedRowsResponse>

  /** 삭제 */
  delete(condition: CommandRequest<ENTITY>): Promise<CommandAffectedRowsResponse>
}
