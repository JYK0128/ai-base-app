import type { EntityData } from '@mikro-orm/core';
import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';

export function withCommandUpdateRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(Base) {}

  return MixinClass as abstract new (
    ...args: ConstructorParameters<TBase>
  ) => EntityData<InstanceType<TBase>>;
}

export type CommandUpdateRequest<TEntity extends Type>
  = InstanceType<ReturnType<typeof withCommandUpdateRequest<TEntity>>>;
