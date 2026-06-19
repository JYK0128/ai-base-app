import { ApiPropertyOptional } from '@nestjs/swagger';
import { type Member } from '@pkg/database';

import { type FilterRequestDto,
         type PageRequestDto,
         SortDirection,
         type SortKey } from '@/common/interfaces';

type GetMemberPageFilterRangesDto = {
  createdAtRange?: [Date, Date]
  updatedAtRange?: [Date, Date]
  deletedAtRange?: [Date, Date]
};

export class GetMemberPageRequestDto implements PageRequestDto<Member> {
  filter: FilterRequestDto<Member> = {};

  @ApiPropertyOptional({
    description: '정렬 필드',
    example: ['createdAt'],
    default: ['createdAt'],
    isArray: true,
  })
  sort!: Array<SortKey<Member>>;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    example: [SortDirection.DESC],
    default: [SortDirection.DESC],
    isArray: true,
  })
  direction!: SortDirection[];

  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  page!: number;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  limit!: number;

  @ApiPropertyOptional({ description: '필터 조건', type: () => Object })
  filters?: FilterRequestDto<Member> & GetMemberPageFilterRangesDto;
}
