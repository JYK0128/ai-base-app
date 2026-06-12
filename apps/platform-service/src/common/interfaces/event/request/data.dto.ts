import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';

export function withEventDataRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(Base) {}

  return MixinClass;
}

export type EventDataRequest<TEntity extends Type>
  = InstanceType<ReturnType<typeof withEventDataRequest<TEntity>>>;
