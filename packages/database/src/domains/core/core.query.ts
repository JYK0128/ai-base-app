import { type BaseEntity, type CountByOptions, type CountOptions, type CreateOptions, type Cursor, type DeleteOptions, type Dictionary, type EntityData, type EntityKey, type EntityManager, type EntityName, type FilterQuery, type FindByCursorOptions, type FindOneOptions, type FindOneOrFailOptions, type FindOptions, type FromEntityType, type Primary, RequestContext, type RequiredEntityData, type UpdateOptions, type WithUsingOptions } from '@mikro-orm/core';
import type { ServerContext } from '@pkg/shared/server';

export const QueryEngine = {
  get em(): EntityManager {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    return em;
  },
  get context(): ServerContext {
    const context = this.em.getLoggerContext<ServerContext>();
    if (!context) throw new Error('ServerContext not found in RequestContext.');
    return context;
  },

  // === helper ===
  getReference<Entity extends object>(
    clz: EntityName<Entity>,
    id: Primary<Entity>,
  ): Entity {
    return this.em.getReference<Entity>(clz, id);
  },

  // === COUNT ===
  count<Entity extends object>(
    clz: EntityName<Entity>,
    where?: FilterQuery<Entity>,
    options?: CountOptions<Entity>,
  ): Promise<number> {
    return this.em.count(clz, where as FilterQuery<NoInfer<Entity>>, options);
  },
  countBy<Entity extends object>(
    clz: EntityName<Entity>,
    groupBy: EntityKey<Entity> | readonly EntityKey<Entity>[],
    options?: CountByOptions<Entity>,
  ): Promise<Dictionary<number>> {
    return this.em.countBy(clz, groupBy, options);
  },

  // === CREATE ===
  create<
    Entity extends object,
    Convert extends boolean = false,
  >(
    clz: EntityName<Entity>,
    data: RequiredEntityData<Entity, never, Convert>,
    options?: CreateOptions<Convert>,
  ): Entity {
    const entity = this.em.create(clz, data, options);
    this.em.persist(entity);
    return entity;
  },
  createMany<Entity extends object>(
    clz: EntityName<Entity>,
    data: RequiredEntityData<Entity>[],
  ): Entity[] {
    const entities = data.map((item) => this.em.create(clz, item));
    this.em.persist(entities);
    return entities;
  },

  // === READ ===
  find<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options?: WithUsingOptions<FindOptions<Entity>, Entity, never>,
  ) {
    return this.em.find(clz, where, options);
  },
  findAndCount<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options?: WithUsingOptions<FindOptions<Entity>, Entity, never>,
  ) {
    return this.em.findAndCount(clz, where, options);
  },
  findByCursor<Entity extends object>(
    clz: EntityName<Entity>,
    options: WithUsingOptions<FindByCursorOptions<Entity>, Entity, never>,
  ): Promise<Cursor<Entity>> {
    return this.em.findByCursor(clz, options);
  },
  findById<Entity extends object>(
    clz: EntityName<Entity>,
    id: Primary<Entity>,
    options?: WithUsingOptions<FindOneOptions<Entity>, Entity, never>,
  ) {
    const where = this.em.getReference(clz, id);
    return this.em.findOne(clz, where, options);
  },
  findOne<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options?: WithUsingOptions<FindOneOptions<Entity>, Entity, never>,
  ) {
    return this.em.findOne(clz, where, options);
  },
  findOneOrFail<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options?: WithUsingOptions<FindOneOrFailOptions<Entity>, Entity, never>,
  ) {
    return this.em.findOneOrFail(clz, where, options);
  },
  async findByPage<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options: Omit<WithUsingOptions<FindOptions<Entity>, Entity, never>, 'offset'> & { page?: number },
  ) {
    const { page = 1, limit = 10, ...restOptions } = options || {};
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const safeOffset = (safePage - 1) * safeLimit;

    const [items, totalCount] = await this.em.findAndCount<Entity>(clz, where as FilterQuery<NoInfer<Entity>>, {
      ...restOptions,
      limit: safeLimit,
      offset: safeOffset,
    });
    const totalPages = Math.ceil(totalCount / safeLimit);

    return {
      items: items,
      totalCount: totalCount,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
      page: safePage,
      limit: safeLimit,
      totalPages: totalPages,
    };
  },

  // === UPDATE ===
  update<Entity extends BaseEntity>(
    entity: Entity,
    data: EntityData<FromEntityType<Entity>>,
  ): Entity {
    if (!entity.isInitialized) throw new Error('Entity is not initialized.');
    return this.em.assign(entity, data);
  },
  nativeUpdate<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    data: EntityData<Entity>,
    options?: UpdateOptions<Entity>,
  ): Promise<number> {
    return this.em.nativeUpdate(clz, where as FilterQuery<NoInfer<Entity>>, {
      ...data,
      updatedAt: new Date(),
      updatedBy: this.context.accountId,
    }, options);
  },

  // === DELETE ===
  delete<Entity extends BaseEntity>(
    entity: Entity,
  ): void {
    if (!entity.isInitialized) throw new Error('Entity is not initialized.');
    this.em.remove(entity);
  },
  nativeDelete<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options?: DeleteOptions<Entity>,
  ): Promise<number> {
    return this.em.nativeDelete(clz, where as FilterQuery<NoInfer<Entity>>, options);
  },
};
