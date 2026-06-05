import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class GetOrganizationsQueryDto {
  @ApiPropertyOptional({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DORMANT'], description: '조직 상태 필터' })
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'DORMANT'])
  status?: string;
}

export class OrganizationActionDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7088', description: '조직 식별자' })
  @IsUUID()
  id!: string;
}
