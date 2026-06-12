import type { RequiredEntityData } from '@mikro-orm/core';
import type { Type } from '@nestjs/common';

export function withCommandCreateRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends Base {}

  return MixinClass as abstract new (
    ...args: ConstructorParameters<TBase>
  ) => RequiredEntityData<InstanceType<TBase>>;
}

export type CommandCreateRequest<TEntity extends Type>
  = ReturnType<typeof withCommandCreateRequest<TEntity>>;
