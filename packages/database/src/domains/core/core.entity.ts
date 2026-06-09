import type { CountOptions, EntityData, EntityName, FilterQuery, FindOneOptions, FindOptions, FromEntityType, IndexFilterQuery, Loaded, Primary, RequiredEntityData, UpdateOptions } from '@mikro-orm/core';
import { BaseEntity, EntityRepositoryType, OptionalProps, RequestContext } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import type { ServerContext } from '@pkg/shared';
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

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ type: 'string', nullable: true })
  createdBy?: string;

  @Property({ type: Date, nullable: true })
  updatedAt?: Date;

  @Property({ type: 'string', nullable: true })
  updatedBy?: string;

  @Property({ type: Date, nullable: true })
  deletedAt?: Date;

  @Property({ type: 'string', nullable: true })
  deletedBy?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  /**
   * 새로운 엔티티를 생성하고 영속화합니다.
   */
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

  /**
   * 실제 데이터베이스 조회 없이 ID만으로 엔티티를 참조할 수 있습니다.
   */
  static getReference<T extends BaseEntity>(
    this: new () => T,
    id: Primary<T>,
  ) {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    const entity = em.getReference<T>(this, id);
    return entity;
  }

  /**
   * 조건에 부합하는 엔티티 개수를 반환합니다.
   */
  static async count<T extends BaseEntity, Hint extends string = never>(
    this: new () => T,
    where: FilterQuery<T> = {},
    options?: CountOptions<T, Hint>,
  ) {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    return em.count<T, Hint>(this, where, options);
  }

  /**
   * 조건에 맞는 단일 엔티티를 조회합니다.
   */
  static async findOne<
    T extends BaseEntity,
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
    Using extends string = never,
  >(
    this: new () => T,
    where: [Using] extends [never]
      ? FilterQuery<NoInfer<T>> : IndexFilterQuery<NoInfer<T>, Using>,
    options?: FindOneOptions<T, Hint, Fields, Excludes> & {
      using?: Using | Using[]
    }): Promise<Loaded<T, Hint, Fields, Excludes> | null> {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    return em.findOne<T, Hint, Fields, Excludes, Using>(this, where, options);
  }

  /**
   * 조건에 맞는 엔티티를 조회합니다.
   */
  static async find<
    T extends BaseEntity,
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
    Using extends string = never>(
    this: new () => T,
    where: [Using] extends [never] ? FilterQuery<NoInfer<T>> : IndexFilterQuery<NoInfer<T>, Using>,
    options?: FindOptions<T, Hint, Fields, Excludes> & {
      using?: Using | Using[]
    }): Promise<Loaded<T, Hint, Fields, Excludes>[]> {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    return em.find<T, Hint, Fields, Excludes, Using>(this, where, options);
  }

  /**
   * 엔티티를 업데이트합니다.
   */
  update(data: EntityData<FromEntityType<this>>) {
    this.assign(data);
    return this;
  }

  /**
   * 엔티티에 대한 삭제 요청을 등록합니다.
   * 실제 반영 방식은 onFlush subscriber가 결정합니다.
   */
  remove() {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    em.remove(this);
  }

  /**
   * 엔티티를 데이터베이스에서 즉시 갱신합니다.
   */
  async nativeUpdate(data: EntityData<this>, options?: UpdateOptions<this>): Promise<number> {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');

    const context = em.getLoggerContext<ServerContext>();
    const entityName = this.constructor as EntityName<this>;
    const where = { id: this.id } as FilterQuery<this>;

    const updateData: EntityData<this> = {
      ...data,
      updatedAt: new Date(),
      updatedBy: context?.accountId,
    };

    return em.nativeUpdate(entityName, where, updateData, options);
  }

  /**
   * 엔티티를 데이터베이스에서 즉시 물리 삭제합니다.
   */
  async nativeDelete(): Promise<number> {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');

    const entityName = this.constructor as EntityName<this>;
    const where = { id: this.id } as FilterQuery<this>;

    return em.nativeDelete(entityName, where);
  }

  /**
   * 엔티티의 ID가 일치하는지 확인합니다.
   */
  is(id: string): boolean {
    return this.id === id;
  }

  /**
   * 엔티티를 영속화합니다.
   */
  persist() {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    em.persist(this);
    return this;
  }
}
