import type { DtoInterface } from './dto.interface';

export type CommandIdResponse<T extends object>
  = 'id' extends keyof T
    ? { id: T['id'] }
    : never;

export type CommandIdsResponse<T extends object>
  = 'id' extends keyof T
    ? { ids: T['id'][] }
    : never;

export type CommandDataResponse<T extends object>
  = DtoInterface<T>;

// eslint-disable-next-line sonarjs/redundant-type-aliases
export type CommandAffectedRowsResponse
  = number;
