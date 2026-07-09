import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Resource, ResourceAction, ResourceScope, ResourceType } from '@pkg/database';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsInt, IsOptional, IsUUID, Matches } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators';
import { EntityRequestType } from '@/common/interfaces';

const RESOURCE_CODE_PATTERN = /^[A-Z_]+$/;

export class UpdateResourceRequestDto extends EntityRequestType(Resource) {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', type: String, description: '리소스 식별자' })
  @Type(() => String)
  @IsUUID()
  override id!: string;

  @ApiPropertyOptional({ example: 'RESOURCE', type: String, description: '리소스 코드' })
  @IsOptional()
  @Type(() => String)
  @Matches(RESOURCE_CODE_PATTERN, { message: '리소스 코드는 영문 대문자와 언더바만 사용할 수 있습니다.' })
  override code?: string;

  @ApiPropertyOptional({ example: '리소스 관리', type: String, description: '리소스 이름' })
  @IsOptional()
  @Type(() => String)
  @IsNotEmptyString({ message: '리소스 이름은 공백만으로 구성될 수 없습니다.' })
  override name?: string;

  @ApiPropertyOptional({ example: ResourceType.MENU, enum: ResourceType, description: '리소스 유형' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(ResourceType)
  override type?: ResourceType;

  @ApiPropertyOptional({ example: ResourceScope.PLATFORM, enum: ResourceScope, description: '리소스 관리 범위' })
  @IsOptional()
  @Type(() => String)
  @IsEnum(ResourceScope)
  override scope?: ResourceScope;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7100', type: String, nullable: true, description: '부모 리소스 식별자' })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  override parent?: string | null;

  @ApiPropertyOptional({ example: '/resources', type: String, nullable: true, description: '리소스 경로' })
  @IsOptional()
  @Type(() => String)
  override path?: string | null;

  @ApiPropertyOptional({ example: 'Key', type: String, nullable: true, description: '아이콘' })
  @IsOptional()
  @Type(() => String)
  override icon?: string | null;

  @ApiPropertyOptional({ example: 1, type: Number, nullable: true, description: '정렬 순서' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  override sortOrder?: number | null;

  @ApiPropertyOptional({ example: [ResourceAction.CREATE, ResourceAction.READ, ResourceAction.UPDATE, ResourceAction.DELETE], isArray: true, enum: ResourceAction, description: '리소스 액션 목록' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => String)
  @IsEnum(ResourceAction, { each: true })
  override actions?: ResourceAction[];
}
