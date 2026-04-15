import { type BaseEntity as BaseEntity, type EntityData, type FilterQuery, type FromEntityType, type Primary } from '@mikro-orm/core';

import { PaginationRepository } from './pagination.repository';

export abstract class CoreRepository<
  T extends BaseEntity,
> extends PaginationRepository<T> {
  // findAll
  // finAndCount

  async findById(id: Primary<T>): Promise<T | null> {
    return this.em.findOne(this.entityName, { id } as FilterQuery<T>);
  }

  async update(id: Primary<T>, data: EntityData<FromEntityType<T>>): Promise<T> {
    const entity = this.em.getReference(this.entityName, id);
    this.em.assign(entity, data);
    return entity;
  }

  async delete(id: Primary<T>): Promise<void> {
    const entity = this.em.getReference(this.entityName, id);
    this.em.remove(entity);
  }
}
