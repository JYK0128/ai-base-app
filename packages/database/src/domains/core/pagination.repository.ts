import { type BaseEntity, EntityRepository, type FilterQuery, type FindAllOptions, type FindByCursorOptions, type FindOptions, type Loaded } from '@mikro-orm/core';

export interface PaginatedResult<
  T,
  Hint extends string = never,
  Fields extends string = never,
  Excludes extends string = never> {
  items: Loaded<T, Hint, Fields, Excludes>[]
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  page: number
  limit: number
  totalPages: number
}

export abstract class PaginationRepository<
  T extends BaseEntity,
> extends EntityRepository<T> {
  /**
   * @deprecated - 차단
   */
  override findAll<Hint extends string = never, Fields extends string = never, Excludes extends string = never>(_options?: FindAllOptions<T, Hint, Fields, Excludes>): Promise<Loaded<T, Hint, Fields, Excludes>[]> {
    throw new Error('findAll is not allowed. Use findByPage or findByCursor instead.');
  }

  override findAndCount<Hint extends string = never, Fields extends string = never, Excludes extends string = never>(where: FilterQuery<T>, options?: FindOptions<T, Hint, Fields, Excludes>): Promise<[Loaded<T, Hint, Fields, Excludes>[], number]> {
    const defaultOrderBy = { createdAt: 'DESC' };
    return super.findAndCount(where, {
      orderBy: defaultOrderBy,
      ...options,
    });
  }

  /**
   * 오프셋 기반 페이지네이션 (전통적인 게시판 방식)
   */
  async findByPage<
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
  >(
    page: number = 1,
    limit: number = 10,
    where: FilterQuery<T> = {},
    options: FindOptions<T, Hint, Fields, Excludes> = {},
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const offset = (safePage - 1) * safeLimit;

    const defaultOrderBy = { createdAt: 'DESC' };
    const [items, total] = await this.em.findAndCount(
      this.entityName,
      where,
      {
        orderBy: defaultOrderBy,
        ...options,
        limit: safeLimit,
        offset,
      },
    );

    const totalPages = Math.ceil(total / safeLimit);
    return {
      items,
      totalCount: total,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
      page: safePage,
      limit: safeLimit,
      totalPages,
    } satisfies PaginatedResult<T, Hint, Fields, Excludes>;
  }

  /**
   * 커서 기반 페이지네이션 (무한 스크롤, 대용량 데이터 최적화)
   * first/after (순방향) 또는 last/before (역방향) 옵션을 사용합니다.
   */
  override async findByCursor<
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
    IncludeCount extends boolean = true,
  >(
    options: FindByCursorOptions<T, Hint, Fields, Excludes, IncludeCount>,
  ) {
    const defaultOrderBy = { createdAt: 'DESC' };
    return super.findByCursor({
      ...options,
      orderBy: options.orderBy ?? defaultOrderBy,
    });
  }
}
