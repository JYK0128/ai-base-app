import type { ObjectQuery } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { SupportTicket } from '@pkg/database';
import { TicketStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsUUID, ValidateNested } from 'class-validator';

import { FilterableRequestDto, PageRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

const TICKET_PAGE_SORT = ['createdAt'] as const;

class GetTicketPageFiltersDto extends FilterableRequestDto<SupportTicket> {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 필터' })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  organization?: string;

  @ApiPropertyOptional({ enum: TicketStatus, example: TicketStatus.OPEN, description: '티켓 상태 필터' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  toFilterQuery(): ObjectQuery<SupportTicket> {
    const queries: ObjectQuery<SupportTicket>[] = [];
    let queryFilter: ObjectQuery<SupportTicket>;

    if (this.organization) {
      queries.push({ organization: { id: this.organization } });
    }

    if (this.status) {
      queries.push({ status: this.status });
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

export class GetTicketPageRequestDto extends PageRequestDto<SupportTicket> {
  @ApiPropertyOptional({ type: () => GetTicketPageFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetTicketPageFiltersDto)
  filters: GetTicketPageFiltersDto = new GetTicketPageFiltersDto();

  @ApiPropertyOptional({ description: '정렬 필드', isArray: true, enum: TICKET_PAGE_SORT })
  @IsOptional()
  @IsIn(TICKET_PAGE_SORT, { each: true })
  @Type(() => String)
  sort: Array<SortKey<SupportTicket>> = ['createdAt'];

  @ApiPropertyOptional({ description: '정렬 방향', isArray: true, enum: SortDirection })
  @IsOptional()
  @IsEnum(SortDirection, { each: true })
  @Type(() => String)
  direction: SortDirection[] = ['desc'];
}
