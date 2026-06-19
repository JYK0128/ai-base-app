import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Organization, SupportTicket } from '@pkg/database';
import { TicketStatus } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ValidateNested } from 'class-validator';

import { type FilterRequestDto, type PageRequestDto, SortDirection, type SortKey } from '@/common/interfaces';

class GetTicketPageFiltersDto {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 필터' })
  @IsOptional()
  @IsUUID()
  organization?: Organization['id'];

  @ApiPropertyOptional({ enum: TicketStatus, example: TicketStatus.OPEN, description: '티켓 상태 필터' })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}

export class GetTicketPageRequestDto implements PageRequestDto<SupportTicket> {
  filter: FilterRequestDto<SupportTicket> = {};

  @ApiPropertyOptional({ description: '정렬 필드', example: ['createdAt'], default: ['createdAt'], isArray: true })
  sort!: Array<SortKey<SupportTicket>>;

  @ApiPropertyOptional({ description: '정렬 방향', enum: SortDirection, example: [SortDirection.DESC], default: [SortDirection.DESC], isArray: true })
  direction!: SortDirection[];

  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  page!: number;

  @ApiPropertyOptional({ description: '페이지 크기', example: 20, default: 20 })
  limit!: number;

  @ApiPropertyOptional({ type: () => GetTicketPageFiltersDto, description: '필터 조건' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GetTicketPageFiltersDto)
  filters?: GetTicketPageFiltersDto;
}
