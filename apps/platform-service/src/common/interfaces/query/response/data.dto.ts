import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';

export function withQueryDataResponse<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(Base) {}

  return MixinClass;
}

export type QueryDataResponse<TBase extends Type>
  = InstanceType<ReturnType<typeof withQueryDataResponse<TBase>>>;
