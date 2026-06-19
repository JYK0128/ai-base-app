import type { Collection,
              Opt,
              Primary,
              PrimaryProperty } from '@mikro-orm/core';

type UnwrapOpt<T> = T extends Opt<infer U> ? U : T;

type EntityResponseValue<T>
  = UnwrapOpt<NonNullable<T>> extends Date
    ? Date
    : UnwrapOpt<NonNullable<T>> extends
    | string
    | number
    | boolean
    | bigint
    | symbol
      ? UnwrapOpt<NonNullable<T>>
      : UnwrapOpt<NonNullable<T>> extends Collection<infer U, infer _Owner>
        ? Array<Primary<NonNullable<U>>>
        : UnwrapOpt<NonNullable<T>> extends readonly (infer U)[]
          ? U extends object
            ? Array<Primary<NonNullable<U>>>
            : T
          : UnwrapOpt<NonNullable<T>> extends object
            ? PrimaryProperty<UnwrapOpt<NonNullable<T>>> extends never
              ? UnwrapOpt<NonNullable<T>>
              : Primary<UnwrapOpt<NonNullable<T>>>
            : UnwrapOpt<NonNullable<T>>;

export type EntityResponseDto<TEntity extends object> = {
  [K in keyof TEntity as TEntity[K] extends (
    ...args: infer _Args
  ) => infer _Return
    ? never
    : K]?: EntityResponseValue<TEntity[K]>;
};
