import type { Collection, Opt, PrimaryProperty } from '@mikro-orm/core';

type UnwrapOpt<T> = T extends Opt<infer U> ? U : T;

export type EntityRequestDto<TEntity extends object> = {
  [K in keyof TEntity as TEntity[K] extends (...args: infer _Args) => infer _Return ? never : K]?: UnwrapOpt<NonNullable<TEntity[K]>> extends Date
    ? Date | null
    : UnwrapOpt<NonNullable<TEntity[K]>> extends string | number | boolean | bigint | symbol
      ? UnwrapOpt<NonNullable<TEntity[K]>> | Extract<TEntity[K], null | undefined>
      : UnwrapOpt<NonNullable<TEntity[K]>> extends Collection<infer _Item, infer _Owner>
        ? string[]
        : UnwrapOpt<NonNullable<TEntity[K]>> extends readonly (infer U)[]
          ? PrimaryProperty<NonNullable<U>> extends never
            ? EntityRequestDto<NonNullable<U>>[]
            : string[]
          : UnwrapOpt<NonNullable<TEntity[K]>> extends object
            ? PrimaryProperty<UnwrapOpt<NonNullable<TEntity[K]>>> extends never
              ? EntityRequestDto<UnwrapOpt<NonNullable<TEntity[K]>>>
              : string
            : UnwrapOpt<NonNullable<TEntity[K]>>;
};
