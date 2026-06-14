import { ApiProperty } from '@nestjs/swagger';
import type { Resource } from '@pkg/database';
import { ResourceScope } from '@pkg/database';
import { IsEnum } from 'class-validator';

import { type ListRequestDto, SortDirection } from '@/common/interfaces';

export class GetResourcesRequestDto implements ListRequestDto<Resource> {
  @ApiPropertyOptional({
    description: '정렬 필드',
    example: ['sortOrder', 'code'],
    default: ['sortOrder', 'code'],
    isArray: true,
  })
  sort!: Array<keyof Resource & string>;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    example: [SortDirection.ASC, SortDirection.ASC],
    default: [SortDirection.ASC, SortDirection.ASC],
    isArray: true,
  })
  direction!: SortDirection[];

  @ApiPropertyOptional({
    description: '오프셋',
    example: 0,
    default: 0,
  })
  offset!: number;

  @ApiPropertyOptional({
    description: '페이지 크기',
    example: 20,
    default: 20,
  })
  limit!: number;

  @ApiProperty({ enum: ResourceScope, example: 'PLATFORM', description: '리소스 관리 범위' })
  @IsEnum(ResourceScope)
  scope!: ResourceScope;
}
