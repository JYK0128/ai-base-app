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
    const andFilters = Object.entries(filters).reduce<FilterQuery<T>[]>((acc, [key, value]) => {
      if (value === undefined || value === null || value === '') return acc;

      const build = (): FilterQuery<T> => {
        // 1. 배열 처리 (IN)
        if (Array.isArray(value))
          return { [key]: { $in: value } } as FilterQuery<T>;

        // 2. LIKE 검색 처리 (문자열에 % 포함 시)
        if (typeof value === 'string' && value.includes('%'))
          return { [key]: { $ilike: value } } as FilterQuery<T>;

        // 3. 범위 검색(Start, End) 처리
        const suffix = (['Start', 'End'] as const).find((s) => key.endsWith(s));
        if (suffix) {
          const field = key.slice(0, -suffix.length);
          const operator = suffix === 'Start' ? '$gte' : '$lte';
          return { [field]: { [operator]: value } } as FilterQuery<T>;
        }

        // 4. 기본 일치 검색
        return { [key]: value } as FilterQuery<T>;
      };

      acc.push(build());
      return acc;
    }, []);

    return (andFilters.length > 0 ? { $and: andFilters } : {}) as FilterQuery<T>;
  }

  /**
   * "field:order" 형식의 문자열을 MikroORM 형식으로 파싱
   */
  private parseOrderBy(orderBy?: OrderByInput<T>): QueryOrderMap<T>[] {
    if (!orderBy) return [];

    const entries = (Array.isArray(orderBy) ? orderBy : orderBy.split(',')).filter(Boolean);

    return entries.map((entry) => {
      const [field, direction] = entry.split(':');
      return {
        [field]: direction?.toLowerCase() === 'asc' ? QueryOrder.ASC : QueryOrder.DESC,
      } as QueryOrderMap<T>;
    });
  }
}
