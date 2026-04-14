import type { EntityData, FilterQuery, FromEntityType, Primary, RequiredEntityData } from '@mikro-orm/core';

import { CoreEntity } from './core.entity';
import { PaginationRepository } from './pagination.repository';

export abstract class CoreRepository<T extends CoreEntity> extends PaginationRepository<T> {
  async findAll(): Promise<T[]> {
    return this.em.find(this.entityName, {});
  }

  async findById(id: Primary<T>): Promise<T | null> {
    return this.em.findOne(this.entityName, { id } as FilterQuery<T>);
  }

  async create(data: RequiredEntityData<T>): Promise<T> {
    const entity = this.em.create(this.entityName, data);
    this.em.persist(entity);
    return entity;
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
