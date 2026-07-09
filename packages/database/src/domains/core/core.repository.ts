import { type BaseEntity, type CountByOptions, type CountOptions, type CreateOptions, type Cursor, type DeleteOptions, type Dictionary, type EntityData, type EntityKey, type EntityManager, type EntityName, type FilterQuery, type FindByCursorOptions, type FindOneOptions, type FindOneOrFailOptions, type FindOptions, type Loaded, type NativeInsertUpdateOptions, type Primary, type RequiredEntityData, type UpdateOptions, type UpsertManyOptions, type UpsertOptions, type WithUsingOptions } from '@mikro-orm/core';

import { QueryEngine } from './core.query';

export abstract class CoreRepository<
  Entity extends BaseEntity,
> {
  constructor(
    protected readonly em: EntityManager,
    protected readonly entityName: EntityName<Entity>,
  ) {}

  // === Count ===
  count<Hint extends string = never>(
    where?: FilterQuery<Entity>,
    options?: CountOptions<Entity, Hint>,
  ): Promise<number> {
    return QueryEngine.count(this.entityName, where, options);
  }

  countBy(
    groupBy: EntityKey<Entity> | readonly EntityKey<Entity>[],
    options?: CountByOptions<Entity>,
  ): Promise<Dictionary<number>> {
    return this.em.countBy(this.entityName, groupBy, options);
  }

  // === Create ===
  create<
    Convert extends boolean = false,
  >(
    data: RequiredEntityData<Entity, never, Convert>,
    options?: CreateOptions<Convert>,
  ): Entity {
    return QueryEngine.create<Entity, Convert>(this.entityName, data, options);
  }

  createMany(
    data: RequiredEntityData<Entity>[],
  ): Entity[] {
    return QueryEngine.createMany(this.entityName, data);
  }

  find<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    return QueryEngine.find<Entity, Hint, Fields, Excludes, Using>(this.entityName, where, options);
  }

  findAndCount<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<[Loaded<Entity, Hint, Fields, Excludes>[], number]> {
    return QueryEngine.findAndCount<Entity, Hint, Fields, Excludes, Using>(this.entityName, where, options);
  }

  findOne<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    return QueryEngine.findOne<Entity, Hint, Fields, Excludes, Using>(this.entityName, where, options);
  }

  findOneOrFail<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOneOrFailOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>> {
    return QueryEngine.findOneOrFail<Entity, Hint, Fields, Excludes, Using>(this.entityName, where, options);
  }

  findById<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    id: Primary<Entity>,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    return QueryEngine.findById<Entity, Hint, Fields, Excludes, Using>(this.entityName, id, options);
  }

  findByCursor<Hint extends string = never, Fields extends string = never, Excludes extends string = never, IncludeCount extends boolean = true, Using extends string = never>(
    options: WithUsingOptions<FindByCursorOptions<Entity, Hint, Fields, Excludes, IncludeCount>, Entity, Using>,
  ): Promise<Cursor<Entity, Hint, Fields, Excludes, IncludeCount>> {
    return QueryEngine.findByCursor<Entity, Hint, Fields, Excludes, IncludeCount, Using>(this.entityName, options);
  }

  findByPage<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
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
    return QueryEngine.findByPage<Entity, Hint, Fields, Excludes, Using>(this.entityName, where, options);
  }

  // === Entity ===
  remove(
    entity: Entity,
  ): void {
    QueryEngine.remove(entity);
  }

  // === Insert ===
  nativeInsert(
    data: RequiredEntityData<Entity>,
    options?: NativeInsertUpdateOptions<Entity>,
  ): Promise<Primary<Entity>> {
    return QueryEngine.nativeInsert(this.entityName, data, options);
  }

  nativeInsertMany(
    data: RequiredEntityData<Entity>[],
    options?: NativeInsertUpdateOptions<Entity>,
  ): Promise<Primary<Entity>[]> {
    return QueryEngine.nativeInsertMany(this.entityName, data, options);
  }

  // === Upsert ===
  nativeUpsert<Fields extends string = never>(
    data: EntityData<Entity> | Entity,
    options?: UpsertOptions<Entity, Fields>,
  ): Promise<Entity> {
    return QueryEngine.nativeUpsert<Entity, Fields>(this.entityName, data, options);
  }

  nativeUpsertMany<Fields extends string = never>(
    data: (EntityData<Entity> | Entity)[],
    options?: UpsertManyOptions<Entity, Fields>,
  ): Promise<Entity[]> {
    return QueryEngine.nativeUpsertMany<Entity, Fields>(this.entityName, data, options);
  }

  // === Update ===
  nativeUpdate(
    where: FilterQuery<Entity>,
    data: EntityData<Entity>,
    options?: UpdateOptions<Entity>,
  ) {
    return QueryEngine.nativeUpdate(this.entityName, where, data, options);
  }

  // === Delete ===
  nativeDelete(
    where: FilterQuery<Entity>,
    options?: DeleteOptions<Entity>,
  ) {
    return QueryEngine.nativeDelete(this.entityName, where, options);
  }
}
