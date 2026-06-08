import { type BaseEntity, type EntityData, type FilterQuery, type FromEntityType, type Primary, RequestContext, type RequiredEntityData, type UpdateOptions } from '@mikro-orm/core';
import type { ServerContext } from '@pkg/shared';

import { SearchableRepository } from './searchable.repository';

export abstract class CoreRepository<
  T extends BaseEntity = BaseEntity,
> extends SearchableRepository<T> {
  override create(data: RequiredEntityData<T>): T {
    const entity = super.create(data);
    this.em.persist(entity);
    return entity;
  }

  async findById(id: Primary<T>): Promise<T | null> {
    return this.em.findOne(this.entityName, { id } as FilterQuery<T>);
  }

  async update(id: Primary<T>, data: EntityData<FromEntityType<T>>): Promise<T> {
    const entity = this.em.getReference(this.entityName, id);
    this.em.assign(entity, data);
    return entity;
  }

  override async nativeUpdate(where: FilterQuery<T>, data: EntityData<T>, options?: UpdateOptions<T>): Promise<number> {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');

    const context = this.em.getLoggerContext<ServerContext>();
    const updateData: EntityData<T> = {
      ...data,
      updatedAt: new Date(),
      updatedBy: context?.accountId,
    };

    return em.nativeUpdate(this.entityName, where, updateData, options);
  }

  /**
   * ID 기준으로 엔티티 삭제 요청을 등록합니다.
   * 실제 soft delete / audit 처리는 onFlush subscriber가 담당합니다.
   */
  async remove(id: Primary<T>): Promise<void> {
    const entity = this.em.getReference(this.entityName, id);
    this.em.remove(entity);
  }
}
