import type { QueryOrderMap } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

import { FilterableRequestDto } from './filterable.request.dto';
import { SortableRequestDto, type SortKey } from './sortable.request.dto';

export type PageFindOptions<TEntity extends object> = {
  orderBy?: QueryOrderMap<TEntity> | QueryOrderMap<TEntity>[]
  limit: number
  page: number
};

export abstract class PageRequestDto<
  TEntity extends object,
  TSortKey extends string = SortKey<TEntity>,
> extends SortableRequestDto<TEntity, TSortKey> {
  abstract filters: FilterableRequestDto<TEntity>;

  @ApiPropertyOptional({ example: 1, type: Number, description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, type: Number, description: '페이지 크기', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  toFilterQuery() {
    return this.filters.toFilterQuery();
  }

  toPageOptions(
    resolvePageOptions?: (options: PageFindOptions<TEntity>) => PageFindOptions<TEntity>,
  ): PageFindOptions<TEntity> {
    const pageOptions: PageFindOptions<TEntity> = {
      orderBy: this.toOrderBy() as PageFindOptions<TEntity>['orderBy'],
      page: this.page,
      limit: this.limit,
    };

    return resolvePageOptions
      ? resolvePageOptions(pageOptions)
      : pageOptions;
  }
}
