import { type BaseEntity, type CountByOptions, type CountOptions, type CreateOptions, type Cursor, type DeleteOptions, type Dictionary, type EntityData, type EntityKey, type EntityManager, type EntityName, type FilterQuery, type FindByCursorOptions, type FindOneOptions, type FindOneOrFailOptions, type FindOptions, type Loaded, type Primary, RequestContext, type RequiredEntityData, type UpdateOptions, type WithUsingOptions } from '@mikro-orm/core';
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
  find<Entity extends object, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    return this.em.find<Entity, Hint, Fields, Excludes, Using>(
      clz,
      where as never,
      options as never,
    );
  },
  findAndCount<Entity extends object, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<[Loaded<Entity, Hint, Fields, Excludes>[], number]> {
    return this.em.findAndCount<Entity, Hint, Fields, Excludes, Using>(
      clz,
      where as never,
      options as never,
    );
  },
  findByCursor<Entity extends object, Hint extends string = never, Fields extends string = never, Excludes extends string = never, IncludeCount extends boolean = true, Using extends string = never>(
    clz: EntityName<Entity>,
    options: WithUsingOptions<FindByCursorOptions<Entity, Hint, Fields, Excludes, IncludeCount>, Entity, Using>,
  ): Promise<Cursor<Entity, Hint, Fields, Excludes, IncludeCount>> {
    return this.em.findByCursor<Entity, Hint, Fields, Excludes, IncludeCount, Using>(clz, options as never);
  },
  findById<Entity extends object, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    id: Primary<Entity>,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    const where = this.em.getReference(clz, id);
    return this.em.findOne<Entity, Hint, Fields, Excludes, Using>(clz, where, options as never);
  },
  findOne<Entity extends object, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    return this.em.findOne<Entity, Hint, Fields, Excludes, Using>(
      clz,
      where as never,
      options as never,
    );
  },
  findOneOrFail<Entity extends object, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options?: FindOneOrFailOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>> {
    return this.em.findOneOrFail<Entity, Hint, Fields, Excludes, Using>(
      clz,
      where as never,
      options as never,
    );
  },
  async findByPage<Entity extends object, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : never,
    options: Omit<FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] }, 'offset'> & { page?: number },
  ): Promise<{
    items: Loaded<Entity, Hint, Fields, Excludes>[]
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 10, ...restOptions } = options || {};
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const safeOffset = (safePage - 1) * safeLimit;

    const [items, totalCount] = await this.em.findAndCount<Entity, Hint, Fields, Excludes, Using>(clz, where as never, {
      ...restOptions,
      limit: safeLimit,
      offset: safeOffset,
    } as never);
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

  // === entity ===
  /** @deprecated - 엔티티 개체 */
  assign(data: unknown) {
    throw new Error('Not implemented');
  },

  remove<Entity extends BaseEntity>(
    entity: Entity,
  ): void {
    if (!entity.isInitialized) throw new Error('Entity is not initialized.');
    this.em.remove(entity);
  },

  // === INSERT ===
  nativeInsert() {

  },

  nativeInsertMany() {

  },

  // === UPSERT ===
  nativeUpsert() {

  },

  nativeUpsertMany() {

  },

  // === UPDATE ===
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
  nativeDelete<Entity extends object>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options?: DeleteOptions<Entity>,
  ): Promise<number> {
    return this.em.nativeDelete(clz, where as FilterQuery<NoInfer<Entity>>, options);
  },
};
