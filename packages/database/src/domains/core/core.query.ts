import { type BaseEntity, CountByOptions, CountOptions, CreateOptions, Cursor, DeleteOptions, Dictionary, EntityData, EntityKey, EntityManager, EntityName, FilterQuery, FindByCursorOptions, FindOneOptions, FindOneOrFailOptions, FindOptions, type IndexFilterQuery, Loaded, NativeInsertUpdateOptions, Primary, RequestContext, RequiredEntityData, UpdateOptions, UpsertManyOptions, UpsertOptions, WithUsingOptions } from '@mikro-orm/core';
import { AuthContext } from '@pkg/shared/server';

export const QueryEngine = {
  get em(): EntityManager {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');
    return em;
  },
  get context(): AuthContext {
    const context = this.em.getLoggerContext<AuthContext>();
    if (!context) throw new Error('AuthContext not found in RequestContext.');
    return context;
  },

  // === Helper ===
  getReference<Entity extends BaseEntity>(
    clz: EntityName<Entity>,
    id: Primary<Entity>,
  ): Entity {
    return this.em.getReference<Entity>(clz, id);
  },

  // === Count ===
  count<Entity extends BaseEntity, Hint extends string = never>(
    clz: EntityName<Entity>,
    where?: FilterQuery<Entity>,
    options?: CountOptions<Entity, Hint>,
  ): Promise<number> {
    return this.em.count(clz, where, options);
  },

  countBy<Entity extends BaseEntity>(
    clz: EntityName<Entity>,
    groupBy: EntityKey<Entity> | readonly EntityKey<Entity>[],
    options?: CountByOptions<Entity>,
  ): Promise<Dictionary<number>> {
    return this.em.countBy(clz, groupBy, options);
  },

  // === Create ===
  create<
    Entity extends BaseEntity,
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

  createMany<
    Entity extends BaseEntity,
  >(
    clz: EntityName<Entity>,
    data: RequiredEntityData<Entity>[],
  ): Entity[] {
    const entities = data.map((item) => this.em.create(clz, item));
    this.em.persist(entities);
    return entities;
  },

  // === Read ===
  find<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : IndexFilterQuery<Entity, Using>,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    return this.em.find<Entity, Hint, Fields, Excludes, Using>(clz, where, options);
  },

  findAndCount<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : IndexFilterQuery<Entity, Using>,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<[Loaded<Entity, Hint, Fields, Excludes>[], number]> {
    return this.em.findAndCount<Entity, Hint, Fields, Excludes, Using>(clz, where, options);
  },

  findOne<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : IndexFilterQuery<Entity, Using>,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    return this.em.findOne<Entity, Hint, Fields, Excludes, Using>(clz, where, options);
  },

  findOneOrFail<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : IndexFilterQuery<Entity, Using>,
    options?: FindOneOrFailOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>> {
    return this.em.findOneOrFail<Entity, Hint, Fields, Excludes, Using>(clz, where, options);
  },

  findById<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    id: Primary<Entity>,
    options?: FindOneOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] },
  ): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
    const where = { id } as [Using] extends [never] ? FilterQuery<Entity> : IndexFilterQuery<Entity, Using>;
    return this.em.findOne<Entity, Hint, Fields, Excludes, Using>(clz, where, options);
  },

  findByCursor<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, IncludeCount extends boolean = true, Using extends string = never>(
    clz: EntityName<Entity>,
    options: WithUsingOptions<FindByCursorOptions<Entity, Hint, Fields, Excludes, IncludeCount>, Entity, Using>,
  ): Promise<Cursor<Entity, Hint, Fields, Excludes, IncludeCount>> {
    return this.em.findByCursor<Entity, Hint, Fields, Excludes, IncludeCount, Using>(clz, options);
  },

  async findByPage<Entity extends BaseEntity, Hint extends string = never, Fields extends string = never, Excludes extends string = never, Using extends string = never>(
    clz: EntityName<Entity>,
    where: [Using] extends [never] ? FilterQuery<Entity> : IndexFilterQuery<Entity, Using>,
    options: Omit<FindOptions<Entity, Hint, Fields, Excludes> & { using?: Using | Using[] }, 'offset'> & { page: number, limit: number },
  ): Promise<{
    items: Loaded<Entity, Hint, Fields, Excludes>[]
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    page: number
    totalPages: number
  }> {
    const { page, limit, ...restOptions } = options || {};
    const offset = (page - 1) * limit;

    const [items, totalCount] = await this.em.findAndCount<Entity, Hint, Fields, Excludes, Using>(
      clz,
      where,
      {
        ...restOptions,
        limit: limit,
        offset: offset,
      },
    );
    const totalPages = Math.ceil(totalCount / limit);

    return {
      items: items,
      totalCount: totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      page: page,
      totalPages: totalPages,
    };
  },

  // === Entity ===
  remove<Entity extends BaseEntity>(
    entity: Entity,
  ): void {
    this.em.remove(entity);
  },

  // === Insert ===
  nativeInsert<Entity extends BaseEntity>(
    clz: EntityName<Entity>,
    data: RequiredEntityData<Entity>,
    options?: NativeInsertUpdateOptions<Entity>,
  ): Promise<Primary<Entity>> {
    return this.em.insert(clz, data, options);
  },

  nativeInsertMany<Entity extends BaseEntity>(
    clz: EntityName<Entity>,
    data: RequiredEntityData<Entity>[],
    options?: NativeInsertUpdateOptions<Entity>,
  ): Promise<Primary<Entity>[]> {
    return this.em.insertMany<Entity>(clz, data, options);
  },

  // === Upsert ===
  nativeUpsert<Entity extends BaseEntity, Fields extends string = never>(
    clz: EntityName<Entity>,
    data: EntityData<Entity> | Entity,
    options?: UpsertOptions<Entity, Fields>,
  ): Promise<Entity> {
    return this.em.upsert<Entity, Fields>(clz, data, options);
  },

  nativeUpsertMany<Entity extends BaseEntity, Fields extends string = never>(
    clz: EntityName<Entity>,
    data: (EntityData<Entity> | Entity)[],
    options?: UpsertManyOptions<Entity, Fields>,
  ): Promise<Entity[]> {
    return this.em.upsertMany<Entity, Fields>(clz, data, options);
  },

  // === Update ===
  nativeUpdate<Entity extends BaseEntity>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    data: EntityData<Entity>,
    options?: UpdateOptions<Entity>,
  ): Promise<number> {
    return this.em.nativeUpdate(clz, where, {
      ...data,
      updatedAt: new Date(),
      updatedBy: this.context.account?.id,
    }, options);
  },

  // === Delete ===
  nativeDelete<Entity extends BaseEntity>(
    clz: EntityName<Entity>,
    where: FilterQuery<Entity>,
    options?: DeleteOptions<Entity>,
  ): Promise<number> {
    return this.em.nativeDelete(clz, where, options);
  },
};
