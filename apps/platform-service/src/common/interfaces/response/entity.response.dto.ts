import type { EntityData } from '@mikro-orm/core';
import type { Type } from '@nestjs/common';
import { DeepPartialType } from '@nestjs/swagger';

export function withEntityResponseDto<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends DeepPartialType(Base) {}

  return MixinClass as abstract new (
    ...args: ConstructorParameters<TBase>
  ) => EntityData<InstanceType<TBase>>;
}

export type EntityResponseDto<TEntity extends Type>
  = InstanceType<ReturnType<typeof withEntityResponseDto<TEntity>>>;
