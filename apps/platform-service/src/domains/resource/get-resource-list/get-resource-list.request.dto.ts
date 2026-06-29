import type { ObjectQuery } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Resource } from '@pkg/database';
import { ResourceScope } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';

import { FilterableRequestDto, ListRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const RESOURCE_LIST_SORT = ['sortOrder', 'code'] as const;

class GetResourceListFiltersDto extends FilterableRequestDto<Resource> {
  @ApiProperty({ enum: ResourceScope, example: ResourceScope.PLATFORM, description: '리소스 관리 범위' })
  @Type(() => String)
  @IsEnum(ResourceScope)
  scope!: ResourceScope;

  toFilterQuery(): ObjectQuery<Resource> {
    return { scope: this.scope };
  }
}

export class GetResourceListRequestDto extends ListRequestDto<Resource> {
  @ApiProperty({ type: () => GetResourceListFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetResourceListFiltersDto)
  filters: GetResourceListFiltersDto = new GetResourceListFiltersDto();

  @ApiPropertyOptional({ description: '정렬 필드', isArray: true, enum: RESOURCE_LIST_SORT })
  @IsOptional()
  @IsIn(RESOURCE_LIST_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<Resource>> = ['sortOrder', 'code'];

  @ApiPropertyOptional({ description: '정렬 방향', isArray: true, enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['asc', 'asc'];
}
