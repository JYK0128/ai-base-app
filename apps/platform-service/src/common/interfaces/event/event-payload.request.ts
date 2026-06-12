import type { Type } from '@nestjs/common';

export function withEventPayloadRequest<TBase extends Type>(_Base: TBase) {
  abstract class MixinClass {}

  return MixinClass;
}

export type EventPayloadRequest<TEntity extends Type>
  = InstanceType<ReturnType<typeof withEventPayloadRequest<TEntity>>>;
