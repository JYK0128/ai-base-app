import type { DtoInterface } from './dto.interface';

export type CommandRequest<T extends object>
  = DtoInterface<T>;

export type CommandDataRequest<T extends object>
  = Omit<DtoInterface<T>, 'id'>;

export type CommandIdRequest<T extends object>
  = 'id' extends keyof T
    ? Omit<T, 'id'> & Required<Pick<T, 'id'>>
    : never;
