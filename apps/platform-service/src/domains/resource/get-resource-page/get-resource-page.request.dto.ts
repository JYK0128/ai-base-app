import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Resource } from '@pkg/database';
import { ResourceScope } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ValidateNested } from 'class-validator';

import { type FilterRequestDto, type ListRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

class GetResourcePageFiltersDto {
  @ApiProperty({ enum: ResourceScope, example: ResourceScope.PLATFORM, description: '리소스 관리 범위' })
  @IsEnum(ResourceScope)
  scope!: ResourceScope;
}

export class GetResourcePageRequestDto implements ListRequestDto<Resource> {
  filter: FilterRequestDto<Resource> = {};

  @ApiPropertyOptional({ description: '정렬 필드', example: ['sortOrder', 'code'], default: ['sortOrder', 'code'], isArray: true })
  sort!: Array<SortKey<Resource>>;

  @ApiPropertyOptional({ description: '정렬 방향', enum: SortDirection, example: [SortDirection.ASC, SortDirection.ASC], default: [SortDirection.ASC, SortDirection.ASC], isArray: true })
  direction!: SortDirection[];

  @ApiPropertyOptional({ description: '오프셋', example: 0, default: 0 })
  offset!: number;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  limit!: number;

  @ApiProperty({ type: GetResourcePageFiltersDto, description: '필터 조건' })
  @ValidateNested()
  @Type(() => GetResourcePageFiltersDto)
  filters!: GetResourcePageFiltersDto;
}
