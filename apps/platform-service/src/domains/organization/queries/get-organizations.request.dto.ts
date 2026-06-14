import { ApiPropertyOptional } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';
import { IsEnum, IsOptional } from 'class-validator';

import { type ListRequestDto, SortDirection } from '@/common/interfaces';

export class GetOrganizationsRequestDto implements ListRequestDto<Organization> {
  @ApiPropertyOptional({
    description: '정렬 필드',
    example: ['createdAt'],
    default: ['createdAt'],
    isArray: true,
  })
  sort!: Array<keyof Organization & string>;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    example: [SortDirection.DESC],
    default: [SortDirection.DESC],
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

  @ApiPropertyOptional({
    enum: OrganizationStatus,
    example: 'ACTIVE',
    description: '메타데이터 날짜로 유추되는 조직 상태 필터',
  })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}
