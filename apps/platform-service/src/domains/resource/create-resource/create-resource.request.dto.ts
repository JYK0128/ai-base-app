import { ApiProperty } from '@nestjs/swagger';
import { Resource, ResourceAction, ResourceScope, ResourceType } from '@pkg/database';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEnum, IsInt, IsUUID, Matches } from 'class-validator';

import { IsNotEmptyString } from '@/common/decorators';
import { EntityRequestType } from '@/common/interfaces';

const RESOURCE_CODE_PATTERN = /^[A-Z_]+$/;

export class CreateResourceRequestDto extends EntityRequestType(Resource) {
  @ApiProperty({ example: 'RESOURCE', type: String, description: '리소스 코드' })
  @Type(() => String)
  @Matches(RESOURCE_CODE_PATTERN, { message: '리소스 코드는 영문 대문자와 언더바만 사용할 수 있습니다.' })
  override code!: string;

  @ApiProperty({ example: '리소스 관리', type: String, description: '리소스 이름' })
  @Type(() => String)
  @IsNotEmptyString({ message: '리소스 이름은 공백만으로 구성될 수 없습니다.' })
  override name!: string;

  @ApiProperty({ example: ResourceType.MENU, enum: ResourceType, description: '리소스 유형' })
  @Type(() => String)
  @IsEnum(ResourceType)
  override type!: ResourceType;

  @ApiProperty({ example: ResourceScope.PLATFORM, enum: ResourceScope, description: '리소스 관리 범위' })
  @Type(() => String)
  @IsEnum(ResourceScope)
  override scope!: ResourceScope;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7100', type: String, nullable: true, description: '부모 리소스 식별자' })
  @Type(() => String)
  @IsUUID()
  override parent!: string | null;

  @ApiProperty({ example: '/resources', type: String, nullable: true, description: '리소스 경로' })
  @Type(() => String)
  override path!: string | null;

  @ApiProperty({ example: 'Key', type: String, nullable: true, description: '아이콘' })
  @Type(() => String)
  override icon!: string | null;

  @ApiProperty({ example: 1, type: Number, nullable: true, description: '정렬 순서' })
  @Type(() => Number)
  @IsInt()
  override sortOrder!: number | null;

  @ApiProperty({ example: [ResourceAction.CREATE, ResourceAction.READ, ResourceAction.UPDATE, ResourceAction.DELETE], isArray: true, enum: ResourceAction, description: '리소스 액션 목록' })
  @IsArray()
  @ArrayUnique()
  @Type(() => String)
  @IsEnum(ResourceAction, { each: true })
  override actions!: ResourceAction[];
}
