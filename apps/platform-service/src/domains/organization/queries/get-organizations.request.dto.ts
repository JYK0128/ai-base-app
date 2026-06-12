import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationStatus } from '@pkg/database';
import { IsEnum, IsOptional } from 'class-validator';

export class GetOrganizationsQueryDto {
  @ApiPropertyOptional({ enum: OrganizationStatus, example: 'ACTIVE', description: '조직 상태 필터' })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}
