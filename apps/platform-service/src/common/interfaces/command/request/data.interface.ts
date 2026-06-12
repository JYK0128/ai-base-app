import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';

export function withCommandDataRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(Base) {
    [key: string]: unknown
  }

  return MixinClass;
}

export type CommandDataRequest<TBase extends Type> = Partial<Omit<InstanceType<TBase>, 'id'>>
  & InstanceType<ReturnType<typeof withCommandDataRequest<TBase>>>;
