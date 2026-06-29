import { ApiPropertyOptional } from '@nestjs/swagger';
import { type MemberInvite } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';

import { CursorRequestDto, FilterableRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const INVITE_LIST_SORT = ['createdAt'] as const;

class GetInviteListFiltersDto extends FilterableRequestDto<MemberInvite> {
  toFilterQuery() {
    return {};
  }
}

export class GetInviteListRequestDto extends CursorRequestDto<MemberInvite> {
  @ApiPropertyOptional({ type: () => GetInviteListFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetInviteListFiltersDto)
  filters: GetInviteListFiltersDto = new GetInviteListFiltersDto();

  @ApiPropertyOptional({ description: '정렬 필드', isArray: true, enum: INVITE_LIST_SORT })
  @IsOptional()
  @IsIn(INVITE_LIST_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<MemberInvite>> = ['createdAt'];

  @ApiPropertyOptional({ description: '정렬 방향', isArray: true, enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc'];
}
