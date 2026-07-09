import type { Collection, EntityName, Opt, PrimaryProperty } from '@mikro-orm/core';
import type { Type as NestType } from '@nestjs/common';

type EntityShape<TEntity extends object> = {
  [K in keyof TEntity as TEntity[K] extends (...args: infer _Args) => infer _Return ? never : K]?: TEntity[K] extends Opt<infer U>
    ? EntityValue<U>
    : EntityValue<TEntity[K]>;
};

type EntityValue<T> = NonNullable<T> extends Date
  ? NonNullable<T> | Extract<T, null>
  : NonNullable<T> extends string | number | boolean | bigint | symbol
    ? NonNullable<T> | Extract<T, null>
    : NonNullable<T> extends Collection<infer _Item, infer _Owner>
      ? unknown[] | null
      : NonNullable<T> extends readonly (infer U)[]
        ? PrimaryProperty<NonNullable<U>> extends never
          ? EntityShape<NonNullable<U>>[] | Extract<T, null>
          : string[] | Extract<T, null>
        : NonNullable<T> extends object
          ? PrimaryProperty<NonNullable<T>> extends never
            ? EntityShape<NonNullable<T>> | Extract<T, null>
            : string | Extract<T, null>
          : NonNullable<T> | Extract<T, null>;

function buildEntityRequestDto<TEntity extends object>(_entityName: EntityName<TEntity>) {
  const DtoClass = class {};

  return DtoClass as NestType<EntityShape<TEntity>>;
}

export function EntityRequestType<TEntity extends object>(entityName: EntityName<TEntity>) {
  return buildEntityRequestDto(entityName);
}
