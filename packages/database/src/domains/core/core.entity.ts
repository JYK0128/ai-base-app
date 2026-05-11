import { BaseEntity, type EntityData, EntityRepositoryType, type FilterQuery, type FindOptions, type FromEntityType, type Loaded, type Opt, OptionalProps, type Primary, RequestContext, type RequiredEntityData } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { uuidv7 } from 'uuidv7';

import type { CoreRepository } from './core.repository';

export abstract class CoreEntity<
  Entity extends BaseEntity = BaseEntity,
  Optional extends keyof Entity = never,
> extends BaseEntity {
  [EntityRepositoryType]?: CoreRepository<Entity>;
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

  @PrimaryKey()
  id: string = uuidv7();

  @Property()
  createdAt: Opt<Date> = new Date();

  @Property({ nullable: true })
  createdBy?: string;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Opt<Date> = new Date();

  @Property({ nullable: true })
  updatedBy?: string;

  @Property({ nullable: true })
  deletedAt?: Date | null = null;

  @Property({ nullable: true })
  deletedBy?: string | null = null;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  static create<T extends BaseEntity>(
    this: new () => T,
    data: RequiredEntityData<T>,
  ) {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    const entity = em.create<T>(this, data);
    em.persist(entity);
    return entity;
  }

  static read<T extends BaseEntity>(
    this: new () => T,
    id: Primary<T>,
  ) {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    const entity = em.getReference<T>(this, id);
    return entity;
  }

  static async find<
    T extends BaseEntity,
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
  >(
    this: new () => T,
    where: FilterQuery<T>,
    options: FindOptions<T, Hint, Fields, Excludes> = {},
  ): Promise<Loaded<T, Hint, Fields, Excludes>[]> {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    return em.find<T, Hint, Fields, Excludes>(this, where, options);
  }

  update(data: EntityData<FromEntityType<this>>) {
    this.assign(data);
    return this;
  }

  delete(hard: boolean = false) {
    if (hard) {
      const em = RequestContext.getEntityManager();
      if (!em) throw new Error('EntityManager not found in RequestContext.');
      em.remove(this);
    }
    else {
      this.deletedAt = new Date();
    }
    return this;
  }
}
