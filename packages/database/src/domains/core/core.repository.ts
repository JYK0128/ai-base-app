import { type BaseEntity, type EntityData, EntityRepository, type FilterQuery, type FindAllOptions, type FindOptions, type FromEntityType, type IndexFilterQuery, type Loaded, type Primary, RequestContext, type RequiredEntityData, type UpdateOptions, type WithUsingOptions } from '@mikro-orm/core';
import type { ServerContext } from '@pkg/shared';

export interface PageOutput<
  T,
  Hint extends string = never,
  Fields extends string = never,
  Excludes extends string = never,
> {
  items: Loaded<T, Hint, Fields, Excludes>[]
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  limit: number
  totalPages: number
}

export abstract class CoreRepository<
  Entity extends BaseEntity = BaseEntity,
> extends EntityRepository<Entity> {
  override create(data: RequiredEntityData<Entity>): Entity {
    const entity = super.create(data);
    this.em.persist(entity);
    return entity;
  }

  async findById(id: Primary<Entity>): Promise<Entity | null> {
    return this.em.findOne(this.entityName, { id } as FilterQuery<Entity>);
  }

  async update(id: Primary<Entity>, data: EntityData<FromEntityType<Entity>>): Promise<Entity> {
    const entity = this.em.getReference(this.entityName, id);
    this.em.assign(entity, data);
    return entity;
  }

  override async nativeUpdate(where: FilterQuery<Entity>, data: EntityData<Entity>, options?: UpdateOptions<Entity>): Promise<number> {
    const em = RequestContext.getEntityManager();
    if (!em) throw new Error('EntityManager not found in RequestContext.');

    const context = this.em.getLoggerContext<ServerContext>();
    const updateData: EntityData<Entity> = {
      ...data,
      updatedAt: new Date(),
      updatedBy: context?.accountId,
    };

    return em.nativeUpdate(this.entityName, where, updateData, options);
  }

  async remove(id: Primary<Entity>): Promise<void> {
    const entity = this.em.getReference(this.entityName, id);
    this.em.remove(entity);
  }

  /**
     * @deprecated - 차단
     */
  override findAll<
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
    Using extends string = never,
  >(
    _options?: WithUsingOptions<FindAllOptions<Entity, Hint, Fields, Excludes>, Entity, Using>,
  ): Promise<Loaded<Entity, Hint, Fields, Excludes>[]> {
    throw new Error('findAll is not allowed. Use find instead.');
  };

  override findAndCount: EntityRepository<Entity>['findAndCount']
    = (async function (
      this: CoreRepository<Entity>,
      where: unknown,
      options: Record<string, unknown> = {},
    ) {
      return EntityRepository.prototype.findAndCount.call(
        this, where, options);
    }) as EntityRepository<Entity>['findAndCount'];

  /**
   * 오프셋 기반 페이지네이션 (전통적인 게시판 방식)
   */
  async findByPage<
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
    Using extends string = never,
  >(
    where: [Using] extends [never] ? FilterQuery<Entity> : IndexFilterQuery<Entity, Using>,
    options?: FindOptions<Entity, Hint, Fields, Excludes> & {
      using?: Using | Using[]
      page?: number
      limit?: number
    },
  ): Promise<PageOutput<Entity, Hint, Fields, Excludes>> {
    const { page = 1, limit = 10, ...restOptions } = options || {};
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const offset = (safePage - 1) * safeLimit;

    const [items, totalCount] = await this.findAndCount<Hint, Fields, Excludes, Using>(
      where,
      {
        limit: safeLimit,
        offset,
        ...restOptions,
      },
    );

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
  }

  /**
   * 커서 기반 페이지네이션 (무한 스크롤, 대용량 데이터 최적화)
   * first/after (순방향) 또는 last/before (역방향) 옵션을 사용합니다.
   */
  override findByCursor: EntityRepository<Entity>['findByCursor']
    = (async function (
      this: CoreRepository<Entity>,
      options: Record<string, unknown> = {},
    ) {
      return EntityRepository.prototype.findByCursor.call(this, options);
    }) as EntityRepository<Entity>['findByCursor'];
}
