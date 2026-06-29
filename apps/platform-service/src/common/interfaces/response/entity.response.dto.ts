import type { Collection, EntityName, Opt, PrimaryProperty } from '@mikro-orm/core';
import type { Type as NestType } from '@nestjs/common';

type EntityResponseShape<TEntity extends object> = {
  [K in keyof TEntity as TEntity[K] extends (...args: infer _Args) => infer _Return ? never : K]?: TEntity[K] extends Opt<infer U>
    ? EntityValue<U>
    : EntityValue<TEntity[K]>;
};

type EntityValue<T> = NonNullable<T> extends Date
  ? Date | null
  : NonNullable<T> extends string | number | boolean | bigint | symbol
    ? NonNullable<T> | Extract<T, null>
    : NonNullable<T> extends Collection<infer _Item, infer _Owner>
      ? unknown[]
      : NonNullable<T> extends readonly (infer U)[]
        ? PrimaryProperty<NonNullable<U>> extends never
          ? EntityResponseShape<NonNullable<U>>[]
          : string[]
        : NonNullable<T> extends object
          ? PrimaryProperty<NonNullable<T>> extends never
            ? EntityResponseShape<NonNullable<T>>
            : string
          : NonNullable<T>;

function buildEntityResponseDto<TEntity extends object>(_entityName: EntityName<TEntity>) {
  const DtoClass = class {};

  return DtoClass as NestType<EntityResponseShape<TEntity>>;
}

export function EntityResponseType<TEntity extends object>(entityName: EntityName<TEntity>) {
  return buildEntityResponseDto(entityName);
}
