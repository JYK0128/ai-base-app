import type { Cursor, EntityManager, EntityName, FilterQuery, FindByCursorOptions, FindOptions, Loaded } from '@mikro-orm/core';

import { BaseEntity } from './base.entity';

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export abstract class PaginationRepository<T extends BaseEntity> {
  constructor(
    protected readonly em: EntityManager,
    protected readonly entityName: EntityName<T>,
  ) {}

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
  ): Promise<PaginatedResult<Loaded<T, Hint, Fields, Excludes>>> {
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

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * 커서 기반 페이지네이션 (무한 스크롤, 대용량 데이터 최적화)
   * first/after (순방향) 또는 last/before (역방향) 옵션을 사용합니다.
   */
  async findByCursor<
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
  >(
    where: FilterQuery<T> = {},
    options: FindByCursorOptions<T, Hint, Fields, Excludes> = {},
  ): Promise<Cursor<T, Hint, Fields, Excludes>> {
    const defaultOrderBy = { createdAt: 'DESC' };
    return this.em.findByCursor(
      this.entityName,
      {
        where,
        orderBy: defaultOrderBy,
        ...options,
      },
    );
  }
}
