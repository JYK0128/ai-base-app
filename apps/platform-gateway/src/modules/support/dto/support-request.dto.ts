import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetTicketsQueryDto {
  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자 필터' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], description: '티켓 상태 필터' })
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: string;
}
