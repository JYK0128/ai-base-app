import { BaseEntity, ConnectionType, type CountByOptions, type CountOptions, type CreateOptions, type Cursor, type DeleteOptions, type Dictionary, type EntityClass, type EntityData, type EntityKey, EntityRepositoryType, type FilterQuery, type FindByCursorOptions, type FindOneOptions, type FindOneOrFailOptions, type FindOptions, type Loaded, LoggingOptions, type NativeInsertUpdateOptions, type Opt, type Primary, type RequiredEntityData, type UpdateOptions, type UpsertManyOptions, type UpsertOptions, type WithUsingOptions } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { QueryBuilder } from '@mikro-orm/postgresql';
import { uuidv7 } from 'uuidv7';

import type { EntityManager as SqlEntityManager } from '@/entities.generated';

import { QueryEngine } from './core.query';
import { CoreRepository } from './core.repository';
export abstract class CoreEntity<
  Entity extends BaseEntity = BaseEntity,
> extends BaseEntity {
  [EntityRepositoryType]?: CoreRepository<Entity>;

  @PrimaryKey()
  id: string = uuidv7();

  @Property({ type: Date })
  createdAt: Opt<Date> = new Date();

  @Property({ type: 'string', nullable: true })
  createdBy: Opt<string> | null = null;

  @Property({ type: Date, nullable: true })
  updatedAt: Opt<Date> | null = null;

  @Property({ type: 'string', nullable: true })
  updatedBy: Opt<string> | null = null;

  @Property({ type: Date, nullable: true })
  deletedAt: Opt<Date> | null = null;

  @Property({ type: 'string', nullable: true })
  deletedBy: Opt<string> | null = null;

  @Property({ type: 'json', nullable: true })
  metadata: Opt<Record<string, unknown>> | null = null;

  @Property({ persist: false })
  get isDeleted(): Opt<boolean> {
    return !!this.deletedAt;
  }

  is(id: string): boolean {
    return this.id === id;
  }

  equal(entity: this) {
    return this.id === entity.id;
  }

  // === Others ===
  static getRepository<T extends CoreEntity<T>>(
    this: EntityClass<T>,
  ): CoreRepository<T> {
    return QueryEngine.em.getRepository<T>(this) as CoreRepository<T>;
  }

  static getQueryBuilder<
    T extends BaseEntity,
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
  static getReference<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    id: Primary<Entity>,
  ): Entity {
    return QueryEngine.getReference<Entity>(this, id);
  }

  // === Count ===
  static count<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    where?: FilterQuery<Entity>,
    options?: CountOptions<Entity>,
  ): Promise<number> {
    return QueryEngine.count(this, where, options);
  }

  static countBy<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    groupBy: EntityKey<Entity> | readonly EntityKey<Entity>[],
    options?: CountByOptions<Entity>,
  ): Promise<Dictionary<number>> {
    return QueryEngine.countBy(this, groupBy, options);
  }

  // === Create ===
  static create<
    Entity extends BaseEntity,
    Convert extends boolean = false,
  >(
    this: EntityClass<Entity>,
    data: RequiredEntityData<Entity, never, Convert>,
    options?: CreateOptions<Convert>,
  ): Entity {
    return QueryEngine.create(this, data, options);
  }

  static createMany<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    data: RequiredEntityData<Entity>[],
  ): Entity[] {
    return QueryEngine.createMany(this, data);
  }

  // === Read ===
  static find<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    return QueryEngine.find<Entity, Hint, Fields, Excludes, Using>(this, where, options);
  }

  static findAndCount<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<[Loaded<Entity, Hint, Fields, Excludes>[], number]> {
    return QueryEngine.findAndCount<Entity, Hint, Fields, Excludes, Using>(this, where, options);
  }

  static findOne<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    return QueryEngine.findOne<Entity, Hint, Fields, Excludes, Using>(this, where, options);
  }

  static findOneOrFail<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOneOrFailOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>> {
    return QueryEngine.findOneOrFail<Entity, Hint, Fields, Excludes, Using>(this, where, options);
  }

  static findById<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<Entity>,
    id: Primary<Entity>,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    return QueryEngine.findById<Entity, Hint, Fields, Excludes, Using>(this, id, options);
  }

  static findByCursor<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, IncludeCount extends boolean = true, Using extends string = never>(
    this: EntityClass<Entity>,
    options: WithUsingOptions<FindByCursorOptions<Entity, Hint, Fields, Excludes, IncludeCount>, Entity, Using>,
  ): Promise<Cursor<Entity, Hint, Fields, Excludes, IncludeCount>> {
    return QueryEngine.findByCursor<Entity, Hint, Fields, Excludes, IncludeCount, Using>(this, options);
  }

  static findByPage<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    this: EntityClass<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options: Omit<FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] }, 'offset'> & { page: number, limit: number },
  ): Promise<{
    items: Loaded<Entity, Hint, Fields, Excludes>[]
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    page: number
    totalPages: number
  }> {
    return QueryEngine.findByPage<Entity, Hint, Fields, Excludes, Using>(this, where, options);
  }

  // === Entity ===
  remove() {
    QueryEngine.remove(this);
  }

  // === Insert ===
  static nativeInsert<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    data: RequiredEntityData<Entity>,
    options?: NativeInsertUpdateOptions<Entity>,
  ): Promise<Primary<Entity>> {
    return QueryEngine.nativeInsert(this, data, options);
  }

  static nativeInsertMany<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    data: RequiredEntityData<Entity>[],
    options?: NativeInsertUpdateOptions<Entity>,
  ): Promise<Primary<Entity>[]> {
    return QueryEngine.nativeInsertMany(this, data, options);
  }

  // === Upsert ===
  static nativeUpsert<Entity extends BaseEntity, Fields extends string = never>(
    this: EntityClass<Entity>,
    data: EntityData<Entity> | Entity,
    options?: UpsertOptions<Entity, Fields>,
  ): Promise<Entity> {
    return QueryEngine.nativeUpsert<Entity, Fields>(this, data, options);
  }

  static nativeUpsertMany<Entity extends BaseEntity, Fields extends string = never>(
    this: EntityClass<Entity>,
    data: (EntityData<Entity> | Entity)[],
    options?: UpsertManyOptions<Entity, Fields>,
  ): Promise<Entity[]> {
    return QueryEngine.nativeUpsertMany<Entity, Fields>(this, data, options);
  }

  // === Update ===
  static nativeUpdate<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    where: FilterQuery<Entity>,
    data: EntityData<Entity>,
    options?: UpdateOptions<Entity>,
  ): Promise<number> {
    return QueryEngine.nativeUpdate(this, where, data, options);
  }

  // === Delete ===
  static nativeDelete<Entity extends BaseEntity>(
    this: EntityClass<Entity>,
    where: FilterQuery<Entity>,
    options?: DeleteOptions<Entity>,
  ): Promise<number> {
    return QueryEngine.nativeDelete(this, where, options);
  }

  // === Native Query - Instance ===
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
