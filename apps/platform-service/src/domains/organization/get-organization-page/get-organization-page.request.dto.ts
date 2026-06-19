import { ApiPropertyOptional } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { ValidateNested } from 'class-validator';

import { type FilterRequestDto, type ListRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

class GetOrganizationPageFiltersDto {
  @ApiPropertyOptional({ enum: OrganizationStatus, example: OrganizationStatus.ACTIVE, description: '메타데이터 날짜로 유추되는 조직 상태 필터' })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}

export class GetOrganizationPageRequestDto implements ListRequestDto<Organization> {
  filter: FilterRequestDto<Organization> = {};

  @ApiPropertyOptional({ description: '정렬 필드', example: ['createdAt'], default: ['createdAt'], isArray: true })
  sort!: Array<SortKey<Organization>>;

  @ApiPropertyOptional({ description: '정렬 방향', enum: SortDirection, example: [SortDirection.DESC], default: [SortDirection.DESC], isArray: true })
  direction!: SortDirection[];

  @ApiPropertyOptional({ description: '오프셋', example: 0, default: 0 })
  offset!: number;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  limit!: number;

  @ApiPropertyOptional({ type: () => GetOrganizationPageFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetOrganizationPageFiltersDto)
  filters?: GetOrganizationPageFiltersDto;
}
