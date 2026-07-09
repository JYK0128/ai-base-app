import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

import { FilterableRequestDto } from './filterable.request.dto';
import { SortableRequestDto, type SortKey } from './sortable.request.dto';

export abstract class CursorRequestDto<
  TEntity extends object,
  TFilters extends FilterableRequestDto<TEntity> = FilterableRequestDto<TEntity>,
  TSortKey extends string = SortKey<TEntity>,
> extends SortableRequestDto<TEntity, TSortKey> {
  abstract filters: TFilters;

  @ApiPropertyOptional({ example: 'eyJpZCI6IjAxOWU1MjM2LWFkYWUtNzBkNy1hOGY3LTJkYzkwYmRmNzA4MSJ9', type: String, nullable: true, description: '커서' })
  @IsOptional()
  @Type(() => String)
  cursor: string | null = null;

  @ApiPropertyOptional({ example: 20, type: Number, description: '페이지 크기' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  toFilterQuery() {
    return this.filters.toFilterQuery();
  }

  toCursorOptions() {
    return {
      orderBy: this.toOrderBy(),
      cursor: this.cursor,
      limit: this.limit,
    };
  }
}
