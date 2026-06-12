import type { Type } from '@nestjs/common';
import { OmitType, PartialType } from '@nestjs/swagger';

export function withEventDataRequest<TBase extends Type>(Base: TBase) {
  abstract class MixinClass extends PartialType(OmitType(Base, ['id'] as const)) {
    [key: string]: unknown
  }

  return MixinClass;
}

export type EventDataRequest<TBase extends Type> = Partial<Omit<InstanceType<TBase>, 'id'>>
  & InstanceType<ReturnType<typeof withEventDataRequest<TBase>>>;
