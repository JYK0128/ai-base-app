import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';

export class RolePermissionListItem extends EntityResponseType(OrganizationRole) {
  constructor(role: OrganizationRole) {
    super();
    this.id = role.id;
    this.code = role.code;
    this.name = role.name;
    this.description = role.description ?? undefined;
    this.permissions = Array.from(
      new Set(
        role.permissions
          .getItems()
          .map(
            (permission) => `${permission.resource.code}:${permission.action}`,
          ),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }

  @ApiProperty({
    example: '019e5236-adae-70d7-a8f7-2dc90bdf7102',
    description: '역할 권한 식별자',
  })
  override id!: string;

  @ApiProperty({ example: 'SUPER_ADMIN', description: '역할 코드' })
  override code!: string;

  @ApiProperty({ example: '플랫폼 전체 권한', description: '역할 권한 이름' })
  override name!: string;

  @ApiPropertyOptional({
    example:
      '시스템 내 모든 최상위 리소스 및 자원에 대한 접근과 제어 권한을 가집니다.',
    description: '역할 권한 설명',
  })
  override description?: string;

  @ApiProperty({
    type: String,
    isArray: true,
    example: ['DASHBOARD:READ', 'RESOURCE:READ'],
    description: '권한 코드 목록',
  })
  override permissions!: string[];
}

export class GetRolePermissionListResponseDto extends ListResponseDto<RolePermissionListItem> {
  constructor(args: ListResponseDto<RolePermissionListItem>) {
    super();
    this.items = args.items;
    this.offset = args.offset;
    this.limit = args.limit;
  }

  @ApiProperty({
    type: () => [RolePermissionListItem],
    example: [],
    description: '역할 권한 목록',
  })
  items!: RolePermissionListItem[];
}
