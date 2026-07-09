import type { ObjectQuery } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';

import { FilterableRequestDto, ListRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const ORGANIZATION_LIST_SORT = ['createdAt'] as const;

class GetOrganizationListFiltersDto extends FilterableRequestDto<Organization> {
  @ApiPropertyOptional({ example: OrganizationStatus.ACTIVE, enum: OrganizationStatus, description: '메타데이터 날짜로 유추되는 조직 상태 필터' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  toFilterQuery(): ObjectQuery<Organization> {
    if (this.status === OrganizationStatus.PENDING) {
      return { metadata: { approvedAt: null, deactivatedAt: null, rejectedAt: null } };
    }

    if (this.status === OrganizationStatus.ACTIVE) {
      return { metadata: { approvedAt: { $ne: null }, deactivatedAt: null, rejectedAt: null } };
    }

    if (this.status === OrganizationStatus.INACTIVE) {
      return { metadata: { deactivatedAt: { $ne: null } } };
    }

    if (this.status === OrganizationStatus.REJECTED) {
      return { metadata: { rejectedAt: { $ne: null } } };
    }

    return {};
  }
}

export class GetOrganizationListRequestDto extends ListRequestDto<Organization> {
  @ApiPropertyOptional({ example: { status: OrganizationStatus.ACTIVE }, type: () => GetOrganizationListFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetOrganizationListFiltersDto)
  filters: GetOrganizationListFiltersDto = new GetOrganizationListFiltersDto();

  @ApiPropertyOptional({ example: ['createdAt'], isArray: true, enum: ORGANIZATION_LIST_SORT, description: '정렬 필드' })
  @IsOptional()
  @IsIn(ORGANIZATION_LIST_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<Organization>> = ['createdAt'];

  @ApiPropertyOptional({ example: ['desc'], isArray: true, enum: SortDirection, description: '정렬 방향' })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc'];
}
