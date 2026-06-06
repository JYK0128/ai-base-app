import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '@pkg/database';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetTicketsQueryDto {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자 필터' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ enum: TicketStatus, example: 'OPEN', description: '티켓 상태 필터' })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
