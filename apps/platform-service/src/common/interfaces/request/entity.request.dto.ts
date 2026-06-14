import type { EntityDTO } from '@mikro-orm/core';

export type EntityRequestDto<TEntity extends object> = {}
  & Partial<EntityDTO<TEntity>>;
