import type { CountOptions, DeleteOptions, EntityData, EntityManager, EntityName, FilterQuery, FindOneOptions, FindOneOrFailOptions, FindOptions, Loaded, Primary, RequiredEntityData, UpdateOptions } from '@mikro-orm/core';

import { QueryEngine } from './core.query';

export abstract class CoreRepository<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Entity extends object = any,
> {
  constructor(
    protected readonly em: EntityManager,
    protected readonly entityName: EntityName<Entity>,
  ) {}

  count(
    where?: FilterQuery<Entity>,
    options?: CountOptions<Entity>,
  ) {
    return QueryEngine.count(this.entityName, where, options);
  }

  // === Create ===
  create(data: RequiredEntityData<Entity>) {
    return QueryEngine.create(this.entityName, data);
  }

  createMany(data: RequiredEntityData<Entity>[]) {
    return QueryEngine.createMany(this.entityName, data);
  }

  find<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    return QueryEngine.find<Entity, Hint, Fields, Excludes, Using>(this.entityName, where, options);
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

  findByPage<Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options: Omit<FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] }, 'offset'> & { page?: number },
  ): Promise<{
    items: Loaded<Entity, Hint, Fields, Excludes>[];
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return QueryEngine.findByPage<Entity, Hint, Fields, Excludes, Using>(this.entityName, where, options);
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
