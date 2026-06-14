import { BaseEntity, ConnectionType, type CountByOptions, type CountOptions, type CreateOptions, type Cursor, type DeleteOptions, type Dictionary, type EntityClass, type EntityData, type EntityKey, EntityRepositoryType, type FilterQuery, type FindByCursorOptions, type FindOneOptions, type FindOneOrFailOptions, type FindOptions, type Loaded, LoggingOptions, type NativeInsertUpdateOptions, OptionalProps, type Primary, type RequiredEntityData, type UpdateOptions, type UpsertManyOptions, type UpsertOptions, type WithUsingOptions } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { QueryBuilder } from '@mikro-orm/postgresql';
import { uuidv7 } from 'uuidv7';

import type { EntityManager as SqlEntityManager } from '@/entities.generated';

import { QueryEngine } from './core.query';
import { CoreRepository } from './core.repository';
export abstract class CoreEntity<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEntity extends object = any,
  Optional extends keyof TEntity = never,
> extends BaseEntity {
  [EntityRepositoryType]?: CoreRepository<TEntity>;
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'isDeleted' | Optional;

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

  @Property({ persist: false })
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  is(id: string): boolean {
    return this.id === id;
  }

  equal(entity: this) {
    return this.id === entity.id;
  }

  // === Others ===
  static getRepository<T extends CoreEntity>(
    this: EntityClass<T>,
  ): CoreRepository<T> {
    return QueryEngine.em.getRepository<T>(this) as CoreRepository<T>;
  }

  // Entity extends object,
  // RootAlias extends string = never>
  // (entityName: EntityName<Entity> | QueryBuilder<Entity>,
  // alias?: RootAlias,
  // type?: ConnectionType,
  // loggerContext?: LoggingOptions): QueryBuilder<Entity, RootAlias>;

  static getQueryBuilder<
    T extends CoreEntity,
    RootAlias extends string = never,
  >(
    this: EntityClass<T>,
    alias?: RootAlias,
    type?: ConnectionType,
    loggerContext?: LoggingOptions,
  ): QueryBuilder<T, RootAlias> {
    return (QueryEngine.em as SqlEntityManager).createQueryBuilder(this, alias, type, loggerContext);
  }

  // === Helper ===
  static getReference<T extends CoreEntity>(
    this: EntityClass<T>,
    id: Primary<T>,
  ): T {
    return QueryEngine.getReference(this, id);
  }

  // === Count ===
  static count<T extends CoreEntity>(
    this: EntityClass<T>,
    where?: FilterQuery<T>,
    options?: CountOptions<T>,
  ): Promise<number> {
    return QueryEngine.count(this, where, options);
  }

  static countBy<T extends CoreEntity>(
    this: EntityClass<T>,
    groupBy: EntityKey<T> | readonly EntityKey<T>[],
    options?: CountByOptions<T>,
  ): Promise<Dictionary<number>> {
    return QueryEngine.countBy(this, groupBy, options);
  }

  // === Create ===
  static create<T extends CoreEntity, Convert extends boolean = false>(
    this: EntityClass<T>,
    data: RequiredEntityData<T, never, Convert>,
    options?: CreateOptions<Convert>,
  ): T {
    return QueryEngine.create(this, data, options);
  }

  static createMany<T extends CoreEntity>(
    this: EntityClass<T>,
    data: RequiredEntityData<T>[],
  ): T[] {
    return QueryEngine.createMany(this, data);
  }

  // === Read ===
  static find<T extends CoreEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<T>,
    where: [Using] extends [never] ? FilterQuery<T> : never,
    options?: FindOptions<T, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<T, Hint, Fields, Excludes>[]> {
    return QueryEngine.find<T, Hint, Fields, Excludes, Using>(this, where as never, options as never);
  }

  static findAndCount<T extends CoreEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<T>,
    where: [Using] extends [never] ? FilterQuery<T> : never,
    options?: FindOptions<T, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<[Loaded<T, Hint, Fields, Excludes>[], number]> {
    return QueryEngine.findAndCount<T, Hint, Fields, Excludes, Using>(this, where as never, options as never);
  }

  static findByCursor<T extends CoreEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, IncludeCount extends boolean = true, Using extends string = never>(
    this: EntityClass<T>,
    options: WithUsingOptions<FindByCursorOptions<T, Hint, Fields, Excludes, IncludeCount>, T, Using>,
  ): Promise<Cursor<T, Hint, Fields, Excludes, IncludeCount>> {
    return QueryEngine.findByCursor<T, Hint, Fields, Excludes, IncludeCount, Using>(this, options as never);
  }

  static findById<T extends CoreEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<T>,
    id: Primary<T>,
    options?: FindOneOptions<T, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<T, Hint, Fields, Excludes> | null> {
    return QueryEngine.findById<T, Hint, Fields, Excludes, Using>(this, id, options as never);
  }

  static findOne<T extends CoreEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<T>,
    where: [Using] extends [never] ? FilterQuery<T> : never,
    options?: FindOneOptions<T, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<T, Hint, Fields, Excludes> | null> {
    return QueryEngine.findOne<T, Hint, Fields, Excludes, Using>(this, where as never, options as never);
  }

  static findOneOrFail<T extends CoreEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<T>,
    where: [Using] extends [never] ? FilterQuery<T> : never,
    options?: FindOneOrFailOptions<T, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<T, Hint, Fields, Excludes>> {
    return QueryEngine.findOneOrFail<T, Hint, Fields, Excludes, Using>(this, where as never, options as never);
  }

  static findByPage<T extends CoreEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<T>,
    where: [Using] extends [never] ? FilterQuery<T> : never,
    options: Omit<FindOptions<T, Hint, Fields, Excludes> & { using?: Using | Using[] }, 'offset'> & { page?: number },
  ): Promise<{
    items: Loaded<T, Hint, Fields, Excludes>[]
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    page: number
    limit: number
    totalPages: number
  }> {
    return QueryEngine.findByPage<T, Hint, Fields, Excludes, Using>(this, where as never, options as never);
  }

  // === Entity ===

  remove() {
    QueryEngine.remove(this);
  }

  // === Native Insert ===
  static nativeInsert<T extends CoreEntity>(
    this: EntityClass<T>,
    data: RequiredEntityData<T>,
    options?: NativeInsertUpdateOptions<T>,
  ): Promise<Primary<T>> {
    return QueryEngine.nativeInsert(this, data, options);
  }

  static nativeInsertMany<T extends CoreEntity>(
    this: EntityClass<T>,
    data: RequiredEntityData<T>[],
    options?: NativeInsertUpdateOptions<T>,
  ): Promise<Primary<T>[]> {
    return QueryEngine.nativeInsertMany(this, data, options);
  }

  // === Native Upsert ===
  static nativeUpsert<T extends CoreEntity, Fields extends string = never>(
    this: EntityClass<T>,
    data: EntityData<T> | T,
    options?: UpsertOptions<T, Fields>,
  ): Promise<T> {
    return QueryEngine.nativeUpsert<T, Fields>(this, data, options);
  }

  static nativeUpsertMany<T extends CoreEntity, Fields extends string = never>(
    this: EntityClass<T>,
    data: (EntityData<T> | T)[],
    options?: UpsertManyOptions<T, Fields>,
  ): Promise<T[]> {
    return QueryEngine.nativeUpsertMany<T, Fields>(this, data, options);
  }

  // === Native Update ===
  nativeUpdate(
    data: EntityData<this>,
    options?: UpdateOptions<this>,
  ): Promise<number> {
    const where = { id: this.id } as FilterQuery<this>;

    return QueryEngine.nativeUpdate<this>(
      this.constructor,
      where,
      data,
      options,
    );
  }

  // === Native Delete ===
  nativeDelete(
    options?: DeleteOptions<this>,
  ): Promise<number> {
    const where = { id: this.id } as FilterQuery<this>;

    return QueryEngine.nativeDelete<this>(
      this.constructor,
      where,
      options,
    );
  }
}
