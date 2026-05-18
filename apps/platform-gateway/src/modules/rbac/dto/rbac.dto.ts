import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

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
