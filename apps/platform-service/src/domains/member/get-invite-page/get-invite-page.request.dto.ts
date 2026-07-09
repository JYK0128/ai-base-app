import type { ObjectQuery } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { type MemberInvite } from '@pkg/database';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';

import { FilterableRequestDto, PageRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const INVITE_PAGE_SORT = ['createdAt'] as const;

class GetInvitePageFiltersDto extends FilterableRequestDto<MemberInvite> {
  @ApiPropertyOptional({ example: 'kim', type: String, description: '검색어' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Type(() => String)
  @IsString()
  search?: string;

  toFilterQuery(): ObjectQuery<MemberInvite> {
    const search = this.search?.trim();

    if (!search) {
      return {};
    }

    return {
      $or: [
        { name: { $ilike: `%${search}%` } },
        { email: { $ilike: `%${search}%` } },
      ],
    };
  }
}

export class GetInvitePageRequestDto extends PageRequestDto<MemberInvite> {
  @ApiPropertyOptional({ example: { search: 'kim' }, type: () => GetInvitePageFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetInvitePageFiltersDto)
  filters: GetInvitePageFiltersDto = new GetInvitePageFiltersDto();

  @ApiPropertyOptional({ example: ['createdAt'], isArray: true, enum: INVITE_PAGE_SORT, description: '정렬 필드' })
  @IsOptional()
  @IsIn(INVITE_PAGE_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<MemberInvite>> = ['createdAt'];

  @ApiPropertyOptional({ example: ['desc'], isArray: true, enum: SortDirection, description: '정렬 방향' })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc'];
}
