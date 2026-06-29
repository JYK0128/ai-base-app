import type { FindOptions } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

import { FilterableRequestDto } from './filterable.request.dto';
import { SortableRequestDto, type SortKey } from './sortable.request.dto';

export type PageFindOptions<TEntity extends object> = Omit<FindOptions<TEntity>, 'offset' | 'using'> & { page: number };

export abstract class PageRequestDto<
  TEntity extends object,
  TSortKey extends string = SortKey<TEntity>,
> extends SortableRequestDto<TEntity, TSortKey> {
  abstract filters: FilterableRequestDto<TEntity>;

  @ApiPropertyOptional({ type: Number, description: '페이지 번호', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ type: Number, description: '페이지 크기', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;

  toFilterQuery() {
    return this.filters.toFilterQuery();
  }

  toPageOptions<TResolved extends PageFindOptions<TEntity> = PageFindOptions<TEntity>>(
    resolvePageOptions?: (options: PageFindOptions<TEntity>) => TResolved,
  ): TResolved {
    const pageOptions = {
      orderBy: this.toOrderBy(),
      page: this.page,
      limit: this.limit,
    } as PageFindOptions<TEntity>;

    return resolvePageOptions
      ? resolvePageOptions(pageOptions)
      : pageOptions as TResolved;
  }
}
