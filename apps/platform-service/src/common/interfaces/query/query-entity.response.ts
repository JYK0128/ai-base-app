import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';

export function withQueryEntityResponse<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(Base) {}

  return MixinClass;
}

export type QueryEntityResponse<TEntity extends Type>
  = InstanceType<ReturnType<typeof withQueryEntityResponse<TEntity>>>;
