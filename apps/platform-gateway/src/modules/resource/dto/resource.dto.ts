import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ResourceTypeDto {
  MENU = 'MENU',
  COMPONENT = 'COMPONENT',
}

export class CreateResourceDto {
  @ApiProperty({ example: 'DASHBOARD', description: '리소스 코드' })
  @IsString()
  code!: string;

  @ApiProperty({ example: '대시보드', description: '리소스 이름' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ResourceTypeDto, example: 'MENU', description: '리소스 유형' })
  @IsEnum(ResourceTypeDto)
  type!: ResourceTypeDto;

  @ApiPropertyOptional({ example: '/dashboard', description: '리소스 경로' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ example: 'LayoutDashboard', description: '아이콘 이름' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7097', description: '부모 리소스 식별자' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CreateResourceResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7098', description: '생성된 리소스 식별자' })
  id!: string;
}

export class UpdateResourceDetailBodyDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '리소스 식별자' })
  @IsUUID()
  id!: string;

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

  @ApiPropertyOptional({ example: 'LayoutDashboard', description: '아이콘 이름' })
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

export class ResourceResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7101', description: '리소스 식별자' })
  id!: string;

  @ApiProperty({ example: 'ORGANIZATION', description: '리소스 코드' })
  code!: string;

  @ApiProperty({ example: '조직 관리', description: '리소스 이름' })
  name!: string;

  @ApiProperty({ example: 'MENU', enum: ['MENU', 'API', 'COMPONENT'], description: '리소스 유형' })
  type!: string;

  @ApiPropertyOptional({ example: '/organizations', description: '경로' })
  path?: string;

  @ApiPropertyOptional({ example: 'Shield', description: '아이콘 이름' })
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: '정렬 순서' })
  sortOrder?: number;

  @ApiProperty({ type: [String], example: ['CREATE', 'READ'], description: '허용 액션 목록' })
  actions!: string[];

  @ApiPropertyOptional({ example: 'READ', description: '제약 조건' })
  constraint?: string;

  @ApiProperty({ type: () => [ResourceResponseDto], description: '하위 리소스 목록' })
  children!: ResourceResponseDto[];
}

export class RoleResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7102', description: '역할 식별자' })
  id!: string;

  @ApiProperty({ example: 'ORGANIZATION.ADMIN', description: '역할 코드' })
  code!: string;

  @ApiProperty({ example: '조직 관리자', description: '역할 이름' })
  name!: string;

  @ApiProperty({ example: 'ORGANIZATION', enum: ['PLATFORM', 'ORGANIZATION'], description: '역할 범위' })
  scope!: string;

  @ApiPropertyOptional({ example: '조직 내 모든 리소스 권한 관리자', description: '역할 설명' })
  description?: string;
}

export class UpdateResourcePermissionsDto {
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

export class UpdateResourceSortDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7099', description: '리소스 식별자' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 1, description: '정렬 순서' })
  sortOrder!: number;
}

export class ResourceDetailResponseDto {
  @ApiProperty({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7101', description: '리소스 식별자' })
  id!: string;

  @ApiProperty({ example: 'ORGANIZATION', description: '리소스 코드' })
  code!: string;

  @ApiProperty({ example: '조직 관리', description: '리소스 이름' })
  name!: string;

  @ApiProperty({ example: 'MENU', enum: ['MENU', 'API', 'COMPONENT'], description: '리소스 유형' })
  type!: string;

  @ApiPropertyOptional({ example: '/organizations', description: '경로' })
  path?: string;

  @ApiPropertyOptional({ example: 'Shield', description: '아이콘 이름' })
  icon?: string;

  @ApiPropertyOptional({ example: 1, description: '정렬 순서' })
  sortOrder?: number;

  @ApiProperty({ type: [String], example: ['CREATE', 'READ'], description: '허용 액션 목록' })
  actions!: string[];

  @ApiPropertyOptional({ example: 'READ', description: '제약 조건' })
  constraint?: string;

  @ApiPropertyOptional({ example: '019e5236-adae-70d7-a8f7-2dc90bdf7100', description: '부모 리소스 식별자' })
  parentId?: string;
}
