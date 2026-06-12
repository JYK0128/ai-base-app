import type { DtoInterface } from './dto.interface';

export type CommandIdResponse<T extends object>
  = 'id' extends keyof T
    ? { id: string }
    : never;

export type CommandIdsResponse<T extends object>
  = 'id' extends keyof T
    ? { ids: string[] }
    : never;

export type CommandDataResponse<T extends object>
  = DtoInterface<T>;

// eslint-disable-next-line sonarjs/redundant-type-aliases
export type CommandAffectedRowsResponse
  = number;
