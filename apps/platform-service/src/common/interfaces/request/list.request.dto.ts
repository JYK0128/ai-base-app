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

  @ApiPropertyOptional({ example: 0, type: Number, description: '오프셋' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({ example: 20, type: Number, nullable: true, description: '페이지 크기' })
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
