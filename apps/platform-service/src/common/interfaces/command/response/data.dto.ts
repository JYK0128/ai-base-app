import type { EntityData } from '@mikro-orm/core';
import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';

export function withCommandDataResponse<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(Base) {}

  return MixinClass as abstract new (
    ...args: ConstructorParameters<TBase>
  ) => EntityData<InstanceType<TBase>>;
}

export type CommandDataResponse<TEntity extends Type>
  = ReturnType<typeof withCommandDataResponse<TEntity>>;
