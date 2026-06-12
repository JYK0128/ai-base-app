import type { EntityData } from '@mikro-orm/core';
import type { Type } from '@nestjs/common';

export function withCommandUpdateRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends Base {}

  return MixinClass as abstract new (
    ...args: ConstructorParameters<TBase>
  ) => EntityData<InstanceType<TBase>>;
}

export type CommandUpdateRequest<TEntity extends Type>
  = ReturnType<typeof withCommandUpdateRequest<TEntity>>;
