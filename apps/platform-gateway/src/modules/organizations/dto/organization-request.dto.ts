import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization, OrganizationStatus } from '@pkg/database';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class GetOrganizationsQueryDto {
  @ApiPropertyOptional({ enum: OrganizationStatus, example: 'ACTIVE', description: '조직 상태 필터' })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;
}

export class OrganizationActionDto implements Pick<Organization, 'id'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '조직 식별자' })
  @IsUUID()
  id!: string;
}
