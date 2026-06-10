import type { CountOptions, DeleteOptions, EntityData, EntityManager, EntityName, FilterQuery, FindOneOptions, FindOneOrFailOptions, FindOptions, Primary, RequiredEntityData, UpdateOptions, WithUsingOptions } from '@mikro-orm/core';

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

  find(
    where: FilterQuery<Entity>,
    options?: WithUsingOptions<FindOptions<Entity>, Entity, never>,
  ) {
    return QueryEngine.find(this.entityName, where, options);
  }

  findOne(
    where: FilterQuery<Entity>,
    options?: WithUsingOptions<FindOneOptions<Entity>, Entity, never>,
  ) {
    return QueryEngine.findOne(this.entityName, where, options);
  }

  findOneOrFail(
    where: FilterQuery<Entity>,
    options?: WithUsingOptions<FindOneOrFailOptions<Entity>, Entity, never>,
  ) {
    return QueryEngine.findOneOrFail(this.entityName, where, options);
  }

  findById(
    id: Primary<Entity>,
    options?: WithUsingOptions<FindOneOptions<Entity>, Entity, never>,
  ) {
    return QueryEngine.findById(this.entityName, id, options);
  }

  findByPage(
    where: FilterQuery<Entity>,
    options: Omit<WithUsingOptions<FindOptions<Entity>, Entity, never>, 'offset'> & { page?: number },
  ) {
    return QueryEngine.findByPage(this.entityName, where, options);
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
