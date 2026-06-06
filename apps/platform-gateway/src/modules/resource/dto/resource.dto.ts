import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole, Resource, ResourceScope, ResourceType } from '@pkg/database';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class CreateResourceDto implements Pick<Resource, 'code' | 'name' | 'type' | 'path'> {
  @ApiProperty({ example: 'DASHBOARD', description: '리소스 코드' })
  @IsString()
  code!: string;

  @ApiProperty({ example: '대시보드', description: '리소스 이름' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ResourceType, example: 'MENU', description: '리소스 유형' })
  @IsEnum(ResourceType)
  type!: ResourceType;

  @ApiPropertyOptional({ example: '/dashboard', description: '리소스 경로' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7097', description: '부모 리소스 식별자' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CreateResourceResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '생성된 리소스 식별자' })
  id!: string;
}

export class UpdateResourceDetailBodyDto implements Pick<Resource, 'id' | 'scope' | 'code' | 'name' | 'path' | 'icon'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '리소스 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ enum: ResourceScope, example: 'PLATFORM', description: '리소스 관리 범위' })
  @IsEnum(ResourceScope)
  scope!: ResourceScope;

  @ApiProperty({ example: 'DASHBOARD', description: '리소스 코드' })
  @IsString()
  code!: string;

  @ApiProperty({ example: '대시보드', description: '리소스 이름' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '/dashboard', description: '리소스 경로' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ example: 'dashboard', description: '아이콘' })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class DeleteResourceResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '삭제된 리소스 식별자' })
  id!: string;
}

export class DeleteResourceBodyDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '리소스 식별자' })
  @IsUUID()
  id!: string;
}

export class GetResourcesQueryDto {
  @ApiProperty({
    enum: ResourceScope,
    example: 'PLATFORM',
    description: '리소스 관리 범위 필터',
  })
  @IsEnum(ResourceScope)
  scope!: ResourceScope;
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
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7100', description: '권한 식별자' })
  id!: string;

  @ApiProperty({ example: 'ORGANIZATION:READ', description: '권한 코드' })
  code!: string;

  @ApiProperty({ example: '조직 조회 권한', description: '권한 이름' })
  name!: string;

  @ApiProperty({ example: 'READ', description: '권한 액션' })
  action!: string;
}

export class ResourceResponseDto implements Pick<Resource, 'id' | 'code' | 'name' | 'type' | 'scope' | 'path' | 'icon' | 'sortOrder' | 'actions' | 'constraint'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '리소스 식별자' })
  id!: string;

  @ApiProperty({ example: 'DASHBOARD', description: '리소스 코드' })
  code!: string;

  @ApiProperty({ example: '대시보드', description: '리소스 이름' })
  name!: string;

  @ApiProperty({ enum: ResourceType, example: 'MENU', description: '리소스 유형' })
  type!: ResourceType;

  @ApiProperty({ enum: ResourceScope, example: 'PLATFORM', description: '리소스 관리 범위' })
  scope!: ResourceScope;

  @ApiPropertyOptional({ example: '/dashboard', description: '리소스 경로' })
  path?: string;

  @ApiPropertyOptional({ example: 'dashboard', description: '아이콘' })
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: '정렬 순서' })
  sortOrder?: number;

  @ApiProperty({ type: [String], example: ['CREATE', 'READ'], description: '리소스 액션 목록' })
  actions!: string[];

  @ApiPropertyOptional({ example: 'READ', description: '제약 조건' })
  constraint?: string;

  @ApiProperty({ type: () => [ResourceResponseDto], description: '하위 리소스 목록' })
  children!: ResourceResponseDto[];
}

export class RoleResponseDto implements Pick<OrganizationRole, 'id' | 'code' | 'name' | 'description'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '역할 식별자' })
  id!: string;

  @ApiProperty({ example: 'ADMIN', description: '역할 코드' })
  code!: string;

  @ApiProperty({ example: '관리자', description: '역할 이름' })
  name!: string;

  @ApiPropertyOptional({ example: '관리자 역할 설명', description: '역할 설명' })
  description?: string;

  @ApiProperty({ example: 'ORGANIZATION', enum: ['PLATFORM', 'ORGANIZATION'], description: '역할 범위' })
  scope!: string;
}

export class PermissionSetResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', description: '권한 세트 식별자' })
  id!: string;

  @ApiProperty({ example: 'SUPER_ADMIN', description: '권한 세트 코드' })
  code!: string;

  @ApiProperty({ example: '플랫폼 전체 권한', description: '권한 세트 이름' })
  name!: string;

  @ApiPropertyOptional({ example: '시스템 내 모든 최상위 리소스 및 자원에 대한 접근과 제어 권한을 가집니다.', description: '권한 세트 설명' })
  description?: string;

  @ApiProperty({ example: 3, description: '배정된 관리자 수' })
  assignmentCount!: number;

  @ApiProperty({ type: [String], example: ['DASHBOARD:READ', 'RESOURCE:READ'], description: '권한 코드 목록' })
  permissionCodes!: string[];
}

export class CreatePermissionSetDto {
  @ApiProperty({ example: 'SYSTEM_OPERATOR', description: '권한 세트 코드' })
  @IsString()
  code!: string;

  @ApiProperty({ example: '시스템 운영 담당자', description: '권한 세트 이름' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '운영 및 모니터링 권한 세트', description: '권한 세트 설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', description: '복사할 권한 세트 식별자' })
  @IsOptional()
  @IsUUID()
  copyFromId?: string;
}

export class UpdatePermissionSetPermissionsDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', description: '권한 세트 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ type: [String], example: ['DASHBOARD:READ', 'RESOURCE:READ'], description: '부여할 권한 코드 목록' })
  @IsArray()
  @IsString({ each: true })
  permissionCodes!: string[];
}

export class UpdateResourcePermissionsDto {
  @ApiProperty({ enum: ResourceScope, example: 'ORGANIZATION', description: '리소스 관리 범위' })
  @IsEnum(ResourceScope)
  scope!: ResourceScope;

  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '리소스 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ type: [String], example: ['CREATE', 'READ'], description: '리소스 액션 목록' })
  @IsArray()
  @IsString({ each: true })
  actions!: string[];

  @ApiPropertyOptional({ example: 'READ', description: '제약 조건' })
  @IsOptional()
  @IsString()
  constraint?: string;
}

export class UpdateResourceSortItemDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '리소스 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 1, description: '정렬 순서' })
  @IsInt()
  sortOrder!: number;
}

export class UpdateResourceSortDto {
  @ApiProperty({ enum: ResourceScope, example: 'ORGANIZATION', description: '리소스 관리 범위' })
  @IsEnum(ResourceScope)
  scope!: ResourceScope;

  @ApiProperty({ type: [UpdateResourceSortItemDto], description: '정렬 대상 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateResourceSortItemDto)
  items!: UpdateResourceSortItemDto[];
}

export class ResourceDetailResponseDto implements Pick<Resource, 'id' | 'code' | 'name' | 'type' | 'scope' | 'path' | 'icon' | 'sortOrder' | 'actions' | 'constraint'> {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '리소스 식별자' })
  id!: string;

  @ApiProperty({ example: 'DASHBOARD', description: '리소스 코드' })
  code!: string;

  @ApiProperty({ example: '대시보드', description: '리소스 이름' })
  name!: string;

  @ApiProperty({ enum: ResourceType, example: 'MENU', description: '리소스 유형' })
  type!: ResourceType;

  @ApiProperty({ enum: ResourceScope, example: 'PLATFORM', description: '리소스 관리 범위' })
  scope!: ResourceScope;

  @ApiPropertyOptional({ example: '/dashboard', description: '리소스 경로' })
  path?: string;

  @ApiPropertyOptional({ example: 'dashboard', description: '아이콘' })
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: '정렬 순서' })
  sortOrder?: number;

  @ApiProperty({ type: [String], example: ['CREATE', 'READ'], description: '리소스 액션 목록' })
  actions!: string[];

  @ApiPropertyOptional({ example: 'READ', description: '제약 조건' })
  constraint?: string;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7100', description: '부모 리소스 식별자' })
  parentId?: string;
}
