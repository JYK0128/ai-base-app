import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export enum ResourceTypeDto {
  MENU = 'MENU',
  COMPONENT = 'COMPONENT',
}

export class CreateResourceDto {
  @ApiProperty({ example: 'DASHBOARD' })
  @IsString()
  code!: string;

  @ApiProperty({ example: '대시보드' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ResourceTypeDto, example: 'MENU' })
  @IsEnum(ResourceTypeDto)
  type!: ResourceTypeDto;

  @ApiPropertyOptional({ example: '/dashboard' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ example: 'LayoutDashboard' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-resource' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CreateResourceResponseDto {
  @ApiProperty({ example: 'uuid-of-new-resource' })
  id!: string;
}

export enum ResourceBatchOperationDto {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export class CreateResourceBatchItemDto {
  @ApiProperty({ enum: ResourceBatchOperationDto, example: 'CREATE' })
  @IsEnum(ResourceBatchOperationDto)
  operation!: ResourceBatchOperationDto;

  @ApiPropertyOptional({ example: 'tmp_123' })
  @IsOptional()
  @IsString()
  tempId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-resource' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ example: 'DASHBOARD' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: '대시보드' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ResourceTypeDto, example: 'MENU' })
  @IsOptional()
  @IsEnum(ResourceTypeDto)
  type?: ResourceTypeDto;

  @ApiPropertyOptional({ example: 'tmp_parent_123' })
  @IsOptional()
  @IsString()
  parentTempId?: string;

  @ApiPropertyOptional({ example: '/dashboard' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ example: 'LayoutDashboard' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-resource' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: { en: 'Dashboard' } })
  @IsOptional()
  translations?: Record<string, string>;

  @ApiPropertyOptional({ type: [String], example: ['READ'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actions?: string[];
}

export class CreateResourcesDto {
  @ApiProperty({ type: [CreateResourceBatchItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResourceBatchItemDto)
  items!: CreateResourceBatchItemDto[];
}

export class CreateResourceBatchResultDto {
  @ApiProperty({ enum: ResourceBatchOperationDto, example: 'CREATE' })
  operation!: ResourceBatchOperationDto;

  @ApiPropertyOptional({ example: 'tmp_123' })
  tempId?: string;

  @ApiProperty({ example: 'uuid-of-new-resource' })
  id!: string;
}

export class CreateResourcesResponseDto {
  @ApiProperty({ type: [CreateResourceBatchResultDto] })
  results!: CreateResourceBatchResultDto[];
}

export class UpdateRolePermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['DASHBOARD:READ', 'ORGANIZATION:READ', 'ORGANIZATION:UPDATE'],
    description: '역할에 부여할 권한 코드 배열',
  })
  @IsArray()
  @IsString({ each: true })
  permissionCodes!: string[];
}

export class PermissionResponseDto {
  @ApiProperty({ example: 'perm_123' })
  id!: string;

  @ApiProperty({ example: 'ORGANIZATION:READ' })
  code!: string;

  @ApiProperty({ example: '조직 조회 권한' })
  name!: string;

  @ApiProperty({ example: 'READ' })
  action!: string;
}

export class ResourceResponseDto {
  @ApiProperty({ example: 'res_123' })
  id!: string;

  @ApiProperty({ example: 'ORGANIZATION' })
  code!: string;

  @ApiProperty({ example: '조직 관리' })
  name!: string;

  @ApiProperty({ example: 'MENU', enum: ['MENU', 'API', 'COMPONENT'] })
  type!: string;

  @ApiPropertyOptional({ example: '/organizations' })
  path?: string;

  @ApiPropertyOptional({ example: 'Shield' })
  icon?: string;

  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;

  @ApiProperty({ type: [String], example: ['CREATE', 'READ'] })
  actions!: string[];

  @ApiPropertyOptional({ example: 'READ' })
  mappedAction?: string;

  @ApiPropertyOptional({ example: { en: 'Dashboard' } })
  translations?: Record<string, string>;

  @ApiProperty({ type: () => [ResourceResponseDto] })
  children!: ResourceResponseDto[];
}

export class RoleResponseDto {
  @ApiProperty({ example: 'role_123' })
  id!: string;

  @ApiProperty({ example: 'ORGANIZATION.ADMIN' })
  code!: string;

  @ApiProperty({ example: '조직 관리자' })
  name!: string;

  @ApiProperty({ example: 'ORGANIZATION', enum: ['PLATFORM', 'ORGANIZATION'] })
  scope!: string;

  @ApiPropertyOptional({ example: '조직 내 모든 리소스 권한 관리자' })
  description?: string;
}
