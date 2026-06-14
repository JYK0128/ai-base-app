import type { EntityDTO } from '@mikro-orm/core';

export type EntityResponseDto<TEntity extends object> = {}
  & Partial<EntityDTO<TEntity>>;
