import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

import { FilterableRequestDto } from './filterable.request.dto';
import { SortableRequestDto, type SortKey } from './sortable.request.dto';

export abstract class ListRequestDto<
  TEntity extends object,
  TFilters extends FilterableRequestDto<TEntity> = FilterableRequestDto<TEntity>,
  TSortKey extends string = SortKey<TEntity>,
> extends SortableRequestDto<TEntity, TSortKey> {
  abstract filters: TFilters;

  @ApiPropertyOptional({ description: '오프셋', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  toFilterQuery() {
    return this.filters.toFilterQuery();
  }

  toListOptions() {
    return {
      orderBy: this.toOrderBy(),
      offset: this.offset,
      limit: this.limit,
    };
  }
}
