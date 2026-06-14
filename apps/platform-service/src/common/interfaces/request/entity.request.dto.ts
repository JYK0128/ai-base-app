import type { EntityData } from '@mikro-orm/core';

export type EntityRequestDto<TEntity extends object> = {}
  & Partial<EntityData<TEntity>>;
