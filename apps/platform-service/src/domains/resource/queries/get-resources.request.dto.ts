import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceScope } from '@pkg/database';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class GetResourcesRequestDto {
  @ApiProperty({ enum: ResourceScope, example: 'PLATFORM', description: '리소스 관리 범위' })
  @IsEnum(ResourceScope)
  scope!: ResourceScope;

  @ApiPropertyOptional({
    type: [String],
    example: ['ORGANIZATION:READ', 'DASHBOARD:READ'],
    description: '필터링에 사용할 권한 코드 목록',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === 'string' && item.length > 0);
    }

    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
  })
  permissions?: string[];

  @ApiPropertyOptional({
    example: false,
    description: '권한 기준으로 리소스를 필터링할지 여부',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  filterByPermissions?: boolean;
}
