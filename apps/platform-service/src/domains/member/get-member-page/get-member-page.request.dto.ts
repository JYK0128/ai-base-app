import type { ObjectQuery } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { type Member, MemberStatus } from '@pkg/database';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';

import { FilterableRequestDto, PageRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const MEMBER_PAGE_SORT = ['createdAt', 'name', 'status', 'lastLoginAt'] as const;
type MemberPageSortKey = SortKey<Member> | 'lastLoginAt';

class GetMemberPageFiltersDto extends FilterableRequestDto<Member> {
  @ApiPropertyOptional({ enum: MemberStatus, description: '멤버 상태 필터', example: MemberStatus.ACTIVE })
  @IsOptional()
  @Type(() => String)
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ description: '검색어', example: 'kim' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Type(() => String)
  @IsString()
  search?: string;

  toFilterQuery(): ObjectQuery<Member> {
    const queries: ObjectQuery<Member>[] = [];
    let queryFilter: ObjectQuery<Member>;

    if (this.status) {
      queries.push({ status: this.status });
    }

    const search = this.search?.trim();
    if (search) {
      queries.push({
        $or: [
          { name: { $ilike: `%${search}%` } },
          { email: { $ilike: `%${search}%` } },
        ],
      });
    }

    if (queries.length === 0) {
      queryFilter = {};
    }
    else if (queries.length === 1) {
      queryFilter = queries[0];
    }
    else {
      queryFilter = { $and: queries };
    }

    return queryFilter;
  }
}

export class GetMemberPageRequestDto extends PageRequestDto<Member, MemberPageSortKey> {
  @ApiPropertyOptional({ type: () => GetMemberPageFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetMemberPageFiltersDto)
  filters: GetMemberPageFiltersDto = new GetMemberPageFiltersDto();

  @ApiPropertyOptional({ description: '정렬 필드', isArray: true, enum: MEMBER_PAGE_SORT })
  @IsOptional()
  @IsIn(MEMBER_PAGE_SORT, { each: true })
  @Type(() => String)
  sort: MemberPageSortKey[] = ['createdAt'];

  @ApiPropertyOptional({ description: '정렬 방향', isArray: true, enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc'];
}
