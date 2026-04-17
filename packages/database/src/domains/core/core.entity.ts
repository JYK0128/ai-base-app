import { BaseEntity, type EntityData, EntityRepositoryType, type FromEntityType, type Opt, OptionalProps, RequestContext, type RequiredEntityData } from '@mikro-orm/core';
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
  createdAt: Date & Opt = new Date();

  @Property({ nullable: true })
  createdBy?: string;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  @Property({ nullable: true })
  updatedBy?: string;

  @Property({ nullable: true })
  deletedAt?: Date | null = null;

  @Property({ nullable: true })
  deletedBy?: string | null = null;

  static create<T extends BaseEntity>(
    this: new () => T,
    data: RequiredEntityData<T>,
  ): T {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    return em.create(this, data);
  }

  update(data: EntityData<FromEntityType<this>>) {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    em.assign(this, data);
    return this;
  }

  delete(hard: boolean = false) {
    if (hard) this.hardDelete();
    else this.softDelete();
    return this;
  }

  private hardDelete() {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    em.remove(this);
    return this;
  }

  private softDelete() {
    this.deletedAt = new Date();
    return this;
  }
}
