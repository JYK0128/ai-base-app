import { type BaseEntity,
         type FilterQuery,
         type FilterValue,
         type FindByCursorOptions,
         type FindOptions,
         QueryOrder,
         type QueryOrderMap } from '@mikro-orm/core';

import { PaginationRepository } from './pagination.repository';

/**
 * 엔티티 필드 기반 공통 검색 필터 타입
 */
export type FilterParams<T> = {
  [K in keyof T]?: FilterValue<T[K]>
} & {
  [K in keyof T as K extends string ? `${K}Start` : never]?: FilterValue<T[K]>
} & {
  [K in keyof T as K extends string ? `${K}End` : never]?: FilterValue<T[K]>
};

export type OrderDirection = 'ASC' | 'DESC' | 'asc' | 'desc';
export type OrderByEntry<T> = `${Extract<keyof T, string>}:${OrderDirection}`;
export type OrderByInput<T> = OrderByEntry<T> | OrderByEntry<T>[] | (string & {});

export type SearchSearchParams<T> = {
  page?: number
  limit?: number
  orderBy?: OrderByInput<T>
} & FilterParams<T>;

export type SearchCursorParams<T> = {
  first?: number
  after?: string | null
  last?: number
  before?: string | null
  orderBy?: OrderByInput<T>
} & FilterParams<T>;

/**
 * 검색 가능한 레포지토리 추상 클래스
 */
export abstract class SearchableRepository<
  T extends BaseEntity = BaseEntity,
> extends PaginationRepository<T> {
  /**
   * 오프셋 기반 페이지네이션 검색
   */
  async search<
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
  >(
    params: SearchSearchParams<T>,
    options: FindOptions<T, Hint, Fields, Excludes> = {},
  ) {
    const { page = 1, limit = 10, orderBy, ...searchFilters } = params;
    const where = this.buildFilter(searchFilters);
    const orderOptions = this.parseOrderBy(orderBy);

    return this.findByPage(page, limit, where, {
      ...options,
      orderBy: orderOptions.length > 0 ? orderOptions : options.orderBy,
    });
  }

  /**
   * 커서 기반 페이지네이션 검색
   */
  async searchByCursor<
    Hint extends string = never,
    Fields extends string = never,
    Excludes extends string = never,
    IncludeCount extends boolean = true,
  >(
    params: SearchCursorParams<T>,
    options: Omit<FindByCursorOptions<T, Hint, Fields, Excludes, IncludeCount>, 'where' | 'first' | 'after' | 'last' | 'before'> = {},
  ) {
    const { first, after, last, before, orderBy, ...searchFilters } = params;
    const where = this.buildFilter(searchFilters);
    const orderOptions = this.parseOrderBy(orderBy);

    const cursorOptions: FindByCursorOptions<T, Hint, Fields, Excludes, IncludeCount> = {
      ...options,
      where,
      first,
      after: after ?? undefined,
      last,
      before: before ?? undefined,
      orderBy: orderOptions.length > 0 ? orderOptions : options.orderBy,
    };

    return this.findByCursor(cursorOptions);
  }

  /**
   * 단순 오브젝트를 MikroORM FilterQuery로 변환
   */
  protected buildFilter(filters: Record<string, unknown>): FilterQuery<T> {
    const andFilters: FilterQuery<T>[] = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;

      if (Array.isArray(value)) {
        andFilters.push({ [key]: { $in: value } } as FilterQuery<T>);
        continue;
      }

      if (typeof value === 'string' && value.includes('%')) {
        andFilters.push({ [key]: { $ilike: value } } as FilterQuery<T>);
        continue;
      }

      const suffix = (['Start', 'End'] as const).find((s) => key.endsWith(s));
      if (suffix) {
        const field = key.slice(0, -suffix.length);
        const operator = suffix === 'Start' ? '$gte' : '$lte';
        andFilters.push({ [field]: { [operator]: value } } as FilterQuery<T>);
        continue;
      }

      andFilters.push({ [key]: value } as FilterQuery<T>);
    }

    return (andFilters.length > 0 ? { $and: andFilters } : {}) as FilterQuery<T>;
  }

  /**
   * "field:order" 형식의 문자열을 MikroORM 형식으로 파싱
   */
  private parseOrderBy(orderBy?: OrderByInput<T>): QueryOrderMap<T>[] {
    if (!orderBy) return [];

    const entries = Array.isArray(orderBy) ? orderBy : orderBy.split(',');
    const orderMaps: QueryOrderMap<T>[] = [];

    for (const entry of entries) {
      if (!entry) continue;
      const [field = '', direction] = entry.split(':');
      if (!field) continue;

      orderMaps.push({
        [field]: direction?.toLowerCase() === 'asc' ? QueryOrder.ASC : QueryOrder.DESC,
      } as QueryOrderMap<T>);
    }

    return orderMaps;
  }
}
