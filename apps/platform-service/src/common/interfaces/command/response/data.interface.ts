import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';

export function withCommandDataResponse<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(Base) {}

  return MixinClass;
}

export type CommandDataResponse<TBase extends Type>
  = InstanceType<ReturnType<typeof withCommandDataResponse<TBase>>>;
