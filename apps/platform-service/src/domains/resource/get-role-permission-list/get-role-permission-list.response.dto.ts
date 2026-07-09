import { ApiProperty } from '@nestjs/swagger';
import { OrganizationRole } from '@pkg/database';

import { EntityResponseType, ListResponseDto } from '@/common/interfaces';
export class RolePermissionListItem extends EntityResponseType(OrganizationRole) {
  constructor(role: OrganizationRole) {
    super();
    this.id = role.id;
    this.code = role.code;
    this.name = role.name;
    this.description = role.description;
    this.permissions = Array.from(new Set(role.permissions
      .getItems()
      .map((permission) => `${permission.resource.code}:${permission.action}`))).sort((left, right) => left.localeCompare(right));
  }

  @ApiProperty({ type: String, description: '역할 권한 식별자' })
  override id!: string;

  @ApiProperty({ type: String, description: '역할 코드' })
  override code!: string;

  @ApiProperty({ type: String, description: '역할 권한 이름' })
  override name!: string;

  @ApiProperty({ type: String, nullable: true, description: '역할 권한 설명' })
  override description!: string | null;

  @ApiProperty({ type: String, isArray: true, description: '권한 코드 목록' })
  override permissions!: string[];
}
export class GetRolePermissionListResponseDto extends ListResponseDto<RolePermissionListItem> {
  constructor(args: GetRolePermissionListResponseDto) {
    super();
    this.items = args.items;
  }

  @ApiProperty({ type: () => [RolePermissionListItem], description: '역할 권한 목록' })
  items!: RolePermissionListItem[];
}
